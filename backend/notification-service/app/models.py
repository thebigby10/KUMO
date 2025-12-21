from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"  # info, warning, error, success
    related_entity_id: Optional[str] = None
    related_entity_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class NotificationResponse(NotificationCreate):
    id: str
    is_read: bool = False
    created_at: datetime
