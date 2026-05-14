# KUMO

**KUMO** is a secure, AI-enhanced coding assessment platform built for university CS labs. It standardizes how instructors create, distribute, and grade programming assignments — with an AI teaching assistant, sandboxed multi-language code execution, automated test running, and academic integrity tools built in.

<img width="1024" height="572" alt="image" src="https://github.com/user-attachments/assets/8454c4d1-f7c4-4a93-8a56-b96304439640" />

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend Services](#backend-services)
- [Frontend](#frontend)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Data Flow](#data-flow)
- [Roles & Permissions](#roles--permissions)

---

## Overview

KUMO bridges the gap between traditional coding assignments and modern AI-assisted education. Instructors build structured lab assignments with PDF materials, starter code, test cases, and hints. Students work in a sandboxed in-browser editor with real-time code execution and an AI assistant grounded in the assignment's reference material. After submission, instructors grade work through a purpose-built interface with AI authorship detection built in.

---

## Key Features

### For Instructors

- Create and manage **labs** (virtual classrooms) with shareable 6-character join codes
- Build **multi-task assignments** with per-task PDF uploads, starter code, test cases, and hints
- **Schedule assignments** with start/end times; auto-submission fires when the timer expires
- View a per-assignment **analytics dashboard** — submission rates, grade averages, per-student progress
- **Grade submissions** in a full-screen split-view editor with inline AI detection and a test-case runner
- Post **announcements** to the class stream

### For Students

- Join labs via a **6-character code**
- Write and run code in a **sandboxed Monaco editor** supporting Python, C, C++, and Java
- Run instructor-defined **test cases** before submitting
- Ask an **AI assistant** questions grounded in the uploaded reference PDF — without getting direct answers to the task
- **Auto-save** drafts every 15 seconds; time-limited assignments auto-submit on expiry
- View **grades and feedback** per task

### Platform-Wide

- **Kiosk mode** — fullscreen lock and paste interception to reduce academic dishonesty
- **Violation logging** — tab switches, external pastes, and fullscreen exits stored on each submission
- **AI-generated code detection** — confidence score and reasoning on submitted work
- **Secure JWT auth** with Google OAuth support
- **PDF file storage** via MinIO (S3-compatible)
- **Real-time notifications** via WebSockets

---

## Architecture

KUMO uses a microservices backend orchestrated with Docker Compose, fronted by a Next.js application that communicates with a shared PostgreSQL database via Prisma.

```
Browser
  │
  ▼
Next.js Frontend (Port 3000)
  ├── Server Actions (auth, grading, submissions, labs)
  ├── API Routes → proxies to backend services
  └── Prisma ORM → PostgreSQL (Port 5432)

Backend Microservices (Docker Compose)
  ├── AI Assistant Service   (Port 8003) — RAG pipeline, ChromaDB, Gemini
  ├── AI Detection Service   (Port 8004) — AI code authorship analysis
  ├── Code Execution Service (Port 8001) — wraps Piston engine
  ├── File Storage Service   (Port 8002) — MinIO S3 wrapper
  ├── Notification Service   (Port 8005) — WebSocket + REST
  └── Auth Service           (Port 3001) — Prisma-backed user/classroom API

Infrastructure
  ├── PostgreSQL             (Port 5432)
  ├── Piston Engine          (Port 2000) — sandboxed multi-language runner
  ├── MinIO Object Storage   (Port 9000/9001)
  └── ChromaDB               (embedded in AI Assistant container)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4 |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL 16 |
| Auth | JWT (`jsonwebtoken`) + Argon2 + Google OAuth (`@react-oauth/google`) |
| AI assistant | Google Gemini 2.5 Flash, `sentence-transformers/all-MiniLM-L6-v2`, ChromaDB |
| AI detection | Google Gemini 2.5 Flash (structured JSON output) |
| Code execution | Piston (open-source sandboxed multi-language runner) |
| File storage | MinIO (S3-compatible) |
| Backend framework | FastAPI + Uvicorn (Python 3.11) |
| Testing | Jest + ts-jest |
| Containerisation | Docker + Docker Compose |
| PDF processing | PyMuPDF (`fitz`), LangChain text splitters |
| Notifications | FastAPI WebSockets |

---

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/15d9f986-88ea-456c-9f71-d1858ef71de7" />


## Project Structure

```
thebigby10-kumo/
├── backend/
│   ├── docker-compose.yml           # Orchestrates all backend services
│   ├── .env.example                 # Required environment variables
│   ├── ai-assistant-service/        # RAG-based PDF Q&A chatbot
│   ├── ai-detection-service/        # AI code authorship detector
│   ├── auth-service/                # User + classroom management API (Node/Prisma)
│   ├── code-execution-service/      # FastAPI wrapper around Piston
│   ├── file-storage-service/        # FastAPI wrapper around MinIO
│   └── notification-service/        # WebSocket + REST notification hub
└── frontend/
    ├── prisma/                      # Prisma schema + migrations
    ├── src/
    │   ├── actions/                 # Next.js Server Actions
    │   ├── app/                     # App Router pages + API routes
    │   ├── components/              # UI components
    │   ├── controller/              # Business logic layer
    │   ├── repositories/            # Data access layer (Prisma queries)
    │   ├── lib/                     # Prisma singleton, utilities
    │   ├── models/                  # Re-exports from Prisma
    │   ├── services/                # Axios API service helpers
    │   └── types/                   # TypeScript type definitions
    └── ...config files
```

---

## Backend Services

### AI Assistant Service (`/backend/ai-assistant-service`)

A Retrieval-Augmented Generation (RAG) chatbot. When an instructor attaches a PDF to a task, it is ingested: text is extracted with PyMuPDF, split into overlapping chunks (800 chars, 200 overlap), embedded with `all-MiniLM-L6-v2`, and stored in ChromaDB. When a student asks a question, the top-5 most relevant chunks are retrieved and passed to Gemini 2.5 Flash with strict system-prompt guardrails that prevent the model from directly solving the task.

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/ingest` | Ingest a PDF for a task (`task_id`, `pdf_url`) |
| `POST` | `/ask` | Answer a student question using retrieved chunks |
| `DELETE` | `/task/{task_id}` | Delete stored embeddings for a task |
| `GET` | `/task/{task_id}/status` | Check if a task has ingested data |

---

### AI Detection Service (`/backend/ai-detection-service`)

Calls Gemini 2.5 Flash with structured JSON output to classify submitted code as human-written or AI-generated, returning a confidence score and reasoning.

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/detect` | Analyze code → `{is_ai_generated, confidence, reasoning}` |

---

### Code Execution Service (`/backend/code-execution-service`)

A thin FastAPI wrapper around the [Piston](https://github.com/engineer-man/piston) sandboxed code execution engine. Supports Python, Java, C, and C++. Language runtimes are installed automatically on startup.

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/runtimes` | List available Piston runtimes |
| `POST` | `/execute` | Execute code (`language`, `source_code`, `stdin`, `args`) |

---

### File Storage Service (`/backend/file-storage-service`)

FastAPI wrapper around MinIO. Generates UUID-named object keys to avoid collisions. The bucket is configured with a public read policy so stored PDFs can be served directly to the browser and to the AI assistant.

| Method | Path | Description |
|---|---|---|
| `POST` | `/upload` | Upload a file; returns `{id, original_name}` |
| `GET` | `/download/{file_id}` | Get a direct public URL for a stored file |

---

### Notification Service (`/backend/notification-service`)

In-memory notification store with WebSocket delivery. Each user connects to `/ws/{user_id}`; the REST endpoint creates a notification and pushes it to the connected client.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/notifications` | Create + push a notification |
| `GET` | `/notifications/{user_id}` | Fetch past notifications |
| `PUT` | `/notifications/{id}/read` | Mark as read |
| `WS` | `/ws/{user_id}` | Real-time WebSocket connection |

---

## Frontend

The frontend is a Next.js 16 App Router application using **Server Actions** for mutations and **Server Components** for data fetching. The architecture follows a layered pattern:

```
Server Action / API Route
    └── Controller (business logic, authorization)
        └── Repository (Prisma queries)
```

### Key Pages

| Route | Description |
|---|---|
| `/` | Landing page with Google Sign-In |
| `/dashboard` | Lab card grid (teaching + enrolled) |
| `/dashboard/lab/[labId]` | Lab stream (announcements) |
| `/dashboard/lab/[labId]/work` | Classwork list (assignments) |
| `/dashboard/lab/[labId]/work/create` | Create assignment form (instructors) |
| `/dashboard/lab/[labId]/work/[workId]/edit` | Edit assignment form |
| `/dashboard/lab/[labId]/work/[workId]/dashboard` | Per-assignment analytics |
| `/dashboard/lab/[labId]/work/[workId]/grade` | Full-screen grading interface |
| `/dashboard/lab/[labId]/people` | Instructors + student list |
| `/dashboard/lab/[labId]/student/[email]` | Individual student dashboard |
| `/work/[workId]` | Student coding environment (kiosk mode) |

### Coding Environment (`/work/[workId]`)

A resizable split-panel layout:

- **Left panel** — task description and embedded PDF viewer
- **Right top** — Monaco editor with language selector, auto-save status, and countdown timer
- **Right bottom** — stdin input, stdout/test output display, and Run / Run Tests / Submit buttons

Kiosk mode uses the Fullscreen API and intercepts clipboard events to log violations. Each violation (tab switch, external paste, fullscreen exit) is stored on the server and surfaced to instructors in the grading interface.

---

## Database Schema

PostgreSQL managed by Prisma. Key models:

```
User
 ├── Enrollment[]     (student → lab)
 ├── Instructor[]     (teacher → lab, role: OWNER | ASSISTANT)
 ├── Announcement[]
 └── Submission[]

Lab
 ├── Enrollment[]
 ├── Instructor[]
 ├── Work[]
 └── Announcement[]

Work  (an assignment)
 ├── Task[]
 ├── LabMaterial[]
 └── Submission[]

Task  (one coding problem within a Work)
 ├── TestCase[]
 ├── Editor[]         (starter code / solution)
 ├── Hint[]
 ├── TaskMaterial[]
 └── Submission[]

Submission            (one per student per task)
 ├── status: DRAFT | SUBMITTED | RETURNED
 ├── code (Text)
 ├── grade (Int?)
 ├── feedback (String?)
 ├── violationCount (Int)
 └── violationLogs (JSON string)
```

Migrations live in `frontend/prisma/migrations/`. The schema is defined in `frontend/prisma/schema.prisma`.

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- A [Google AI Studio API key](https://aistudio.google.com/apikey) (free tier) for the AI services
- A PostgreSQL database (handled automatically by Docker Compose for local development)

### Environment Variables

**Backend** — create `backend/.env` from `backend/.env.example`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Frontend** — create `frontend/.env.local`:

```env
DATABASE_URL=postgresql://kumo_admin:secure_password_123@localhost:5432/kumo_auth
JWT_SECRET=your-jwt-secret-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Backend service URLs (defaults work with local Docker Compose)
PISTON_URL=http://localhost:8001/execute
AI_ASSISTANT_URL=http://localhost:8003
AI_DETECT_URL=http://localhost:8004/detect
```

### Running the Backend

```bash
cd backend

# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down
```

On first startup, `piston_installer` automatically downloads and installs the Python, Java, and GCC runtimes into Piston. This takes a few minutes.

#### Service Port Mapping

| Service | Host Port | Description |
|---|---|---|
| Auth Service | 3001 | Node.js / Prisma API |
| Code Execution API | 8001 | Piston wrapper |
| File Storage API | 8002 | MinIO wrapper |
| AI Assistant | 8003 | RAG chatbot |
| AI Detection | 8004 | Code authorship detector |
| Notification Service | 8005 | WebSocket hub |
| Piston Engine | 2000 | Sandboxed code runner |
| MinIO API | 9000 | S3-compatible storage |
| MinIO Console | 9001 | Web UI |
| PostgreSQL | 5432 | Main database |

> **Note on internal networking:** When services communicate with each other inside Docker, they use their service names (e.g. `postgres:5432`, `minio:9000`) rather than `localhost`.

#### Default Credentials

| Service | Username | Password |
|---|---|---|
| PostgreSQL | `kumo_admin` | `secure_password_123` |
| MinIO | `admin` | `password123` |

### Running the Frontend

```bash
cd frontend

npm install

# Apply Prisma migrations (required on first run or after schema changes)
npx prisma migrate deploy

# Start development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## API Reference

These Next.js API routes are internal proxies that forward requests to the backend microservices.

| Method | Path | Proxies To |
|---|---|---|
| `POST` | `/api/code-execution/execute` | Code Execution Service `/execute` |
| `GET` | `/api/code-execution/health` | Code Execution Service health check |
| `POST` | `/api/ai-assistant/ask` | AI Assistant Service `/ask` |
| `POST` | `/api/ai-assistant/ingest` | AI Assistant Service `/ingest` |
| `GET/POST/DELETE` | `/api/enroll` | Prisma — enrollment management |
| `POST` | `/api/enroll/lab-code` | Prisma — join by lab code |
| `GET/POST` | `/api/labs` | Prisma — lab CRUD |
| `GET/PUT/PATCH/DELETE` | `/api/labs/[id]` | Prisma — individual lab management |

---

## Testing

The project uses Jest with `ts-jest` for the frontend.

```bash
cd frontend

# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests are colocated with source files in `__tests__/` directories throughout `src/`. Coverage includes:

- **Repository tests** — verify Prisma query construction
- **Controller tests** — verify authorization logic and business rules
- **Action tests** — verify Server Action input validation and error handling

---

<img width="1024" height="572" alt="image" src="https://github.com/user-attachments/assets/49945ca3-46aa-4fe9-bfe6-cda93648751e" />

## Data Flow

### Student Submits Code

1. Student writes code in the Monaco editor. Auto-save fires every 15 seconds via the `autoSaveCode` Server Action → `submission.update` in Prisma.
2. Student clicks **Submit** → `submitTaskAction` saves final code → `SubmissionController.runTestCases` sends code to the Code Execution Service (Piston) for each test case → returns pass/fail results.
3. Submission status changes to `SUBMITTED`.

### Instructor Grades

1. Instructor opens the grading interface → `SubmissionRepository.findAllByWorkId` loads all submissions.
2. Instructor optionally clicks **Run Tests** → `runTestsAction` re-executes code against test cases.
3. Instructor clicks **Analyze AI** → `evaluateAISubmissionAction` → AI Detection Service → returns `{is_ai_generated, confidence, reasoning}`.
4. Instructor enters a grade and feedback → `gradeTaskAction` → `SubmissionRepository.gradeById` → status set to `RETURNED`.

### AI Assistant Query

1. Instructor creates a task with a PDF → `triggerPdfIngestion` → AI Assistant Service `/ingest` → PDF is downloaded, text extracted, chunked, and embedded into ChromaDB.
2. Student asks a question in the AI chat panel → `POST /api/ai-assistant/ask` → AI Assistant Service → top-5 relevant chunks retrieved → Gemini 2.5 Flash generates a guarded answer → returned to the student.

---

## Roles & Permissions

| Action | Student (Enrolled) | Instructor (Assistant) | Instructor (Owner) |
|---|---|---|---|
| View stream & announcements | ✅ | ✅ | ✅ |
| Post announcement | ✅ | ✅ | ✅ |
| View classwork | ✅ | ✅ | ✅ |
| Submit code | ✅ | — | — |
| Create / edit assignment | — | ✅ | ✅ |
| Delete assignment | — | ✅ | ✅ |
| Grade submissions | — | ✅ | ✅ |
| View student dashboard | — | ✅ | ✅ |
| Edit lab details | — | ✅ | ✅ |
| Delete lab | — | — | ✅ |
| Add assistant instructor | — | — | ✅ |

Roles are enforced server-side in each Controller and Server Action by querying the `Instructor` table before performing any privileged operation.
