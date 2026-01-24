# Kumo Backend Infrastructure

This project uses a root `docker-compose.yml` to orchestrate all backend microservices, databases, and the code execution engine.

## 🚀 Quick Start

```bash
# Start all services
docker-compose up --build

# Stop all services
docker-compose down
```

## 🔌 Service Port Mappings

Below are the ports exposed to your **Local Machine** (`localhost`).

| Service | Host Port | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `3001` | `3001` | User authentication & classroom management API. |
| **Code Execution API** | `8001` | `8000` | Python wrapper API for running student code. |
| **File Storage API** | `8002` | `8000` | Service for uploading/downloading files. |
| **Piston Engine** | `2000` | `2000` | The core compiler/runner engine. |
| **MinIO Console** | `9001` | `9001` | Web UI for managing file buckets (S3). |
| **MinIO API** | `9000` | `9000` | S3-compatible file upload endpoint. |
| **PostgreSQL** | `5432` | `5432` | Main database for Auth/Classroom data. |

## 🔑 Default Credentials

| Service | User / Access Key | Password / Secret Key | Database / Bucket |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `kumo_admin` | `secure_password_123` | `kumo_auth` |
| **MinIO** | `admin` | `password123` | `kumo-bucket` |

## 🌐 Internal Networking

When services communicate with each other **inside** Docker, they must use the **Service Name**, not `localhost`.

*   **Auth** connects to DB via: `postgres:5432`
*   **Code API** connects to Piston via: `http://piston:2000`
*   **File API** connects to MinIO via: `minio:9000`
