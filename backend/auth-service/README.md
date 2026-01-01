# Kumo Auth Service

This is the backend authentication service for the Kumo application. It uses Node.js, Prisma ORM, and a PostgreSQL database.

## Prerequisites

Before running the project, ensure you have the following installed:
- **Node.js** (LTS version recommended)
- **Docker** (For running the PostgreSQL database)

## Getting Started

### 1. Environment Configuration

Create a `.env` file in the root directory of the project. You need to configure the `DATABASE_URL` to match the credentials used in the Docker container below.

**`.env`**
```env
# Connection string format: postgresql://USER:PASSWORD@HOST:PORT/DB
DATABASE_URL="postgresql://kumo_admin:secure_password_123@localhost:5432/kumo_auth?schema=public"
```

### 2. Start the Database

Run the following Docker command to spin up the PostgreSQL container with the required user, password, and database name:

```bash
docker run --name kumo-db \
  -e POSTGRES_USER=kumo_admin \
  -e POSTGRES_PASSWORD=secure_password_123 \
  -e POSTGRES_DB=kumo_auth \
  -p 5432:5432 \
  -d postgres
```

> **Note:** If you need to stop or start the database later without removing the data, use:
> *   Stop: `docker stop kumo-db`
> *   Start: `docker start kumo-db`

### 3. Install Dependencies

Install the project dependencies via npm:

```bash
npm install
```

### 4. Database Migration & Client Generation

Once the database is running and dependencies are installed, run the Prisma commands to generate the client and apply schema migrations:

```bash
# Generate the Prisma Client
npx prisma generate

# Run migrations to create tables in the DB
npx prisma migrate dev
```

### 5. Run the Application

Finally, start the development server:

```bash
npm run dev
```

The service should now be running (usually on `http://localhost:3000` or whatever port is defined in your main application file).

## Useful Commands

| Command | Description |
| :--- | :--- |
| `npx prisma studio` | Opens a GUI to view and edit database data. |
| `npx prisma migrate reset` | Resets the database and re-applies all migrations (warning: deletes data). |
| `docker rm -f kumo-db` | Force removes the database container (deletes data if volume not mapped). |
