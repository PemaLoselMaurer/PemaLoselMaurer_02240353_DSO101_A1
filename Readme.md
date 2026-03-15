# Task Manager: FE + BE + DB

This project includes:

1. Frontend (Next.js): add, edit, delete tasks
2. Backend (Node.js + Express): CRUD API
3. Database: deferred for now (backend runs in memory)

## Project Structure

- Frontend/
- Backend/

## 1) Start Backend API (Express)

From Backend/:

1. npm install
2. npm run dev

API runs on http://localhost:5000

### CRUD Endpoints

- GET /api/tasks
- GET /api/tasks/:id
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

## 2) Start Frontend (Next.js)

From Frontend/:

1. npm install
2. Copy .env.local.example to .env.local
3. npm run dev

Frontend runs on http://localhost:3000

## Task Model

- id (number)
- title (required)
- description
- status: pending | in-progress | done
- due_date
- created_at
- updated_at

## Notes

- Tasks are stored in memory while the server is running.
- Data resets whenever the backend restarts.
- PostgreSQL can be reintroduced later without changing the frontend API.
