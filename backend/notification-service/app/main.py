import asyncio
from typing import Dict, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid
import json

from .models import NotificationCreate, NotificationResponse

app = FastAPI(
    title="KUMO Notification Service",
    description="Real-time notifications using WebSockets and REST",
    version="1.0.0"
)

# Allow CORS for local development and specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for simplicity (replace with Redis/Postgres in production)
notifications_db: List[NotificationResponse] = []

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        # Maps user_id to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"User {user_id} connected. Total active sessions: {len(self.active_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if len(self.active_connections[user_id]) == 0:
                del self.active_connections[user_id]
        print(f"User {user_id} disconnected.")

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_text(message)

    async def broadcast(self, message: str):
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                await connection.send_text(message)

manager = ConnectionManager()

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "notification-service"}

@app.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(notification: NotificationCreate):
    """
    Create a new notification and push it to the connected user via WebSocket.
    """
    new_notification = NotificationResponse(
        id=str(uuid.uuid4()),
        created_at=datetime.utcnow(),
        **notification.model_dump()
    )
    
    # Save to "db"
    notifications_db.append(new_notification)
    
    # Notify user via WebSockets if they are connected
    # Realistically, you would use a pub/sub system to notify multiple instances
    await manager.send_personal_message(
        new_notification.model_dump_json(),
        notification.user_id
    )
    
    return new_notification

@app.get("/notifications/{user_id}", response_model=List[NotificationResponse])
async def get_user_notifications(user_id: str, unread_only: bool = False):
    """
    Retrieve past notifications for a user.
    """
    user_notifications = [n for n in notifications_db if n.user_id == user_id]
    if unread_only:
        user_notifications = [n for n in user_notifications if not n.is_read]
        
    # Sort by created_at descending
    return sorted(user_notifications, key=lambda x: x.created_at, reverse=True)

@app.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_as_read(notification_id: str):
    """
    Mark a specific notification as read.
    """
    for n in notifications_db:
        if n.id == notification_id:
            n.is_read = True
            return n
    raise HTTPException(status_code=404, detail="Notification not found")

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time notification delivery.
    """
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive, listen for any messages from client
            # For notifications, the client might only receive, or send a ping
            data = await websocket.receive_text()
            # We can parse the received `data` e.g., to handle "mark as read" via WS
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await websocket.send_text(json.dumps({"action": "pong"}))
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
