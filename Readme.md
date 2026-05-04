# Campus Hub

A closed-loop SaaS ecosystem for university student communities. Campus Hub connects students, clubs, vendors, and university staff in a single platform — enabling event management, marketplace transactions, and community collaboration.

## Tech Stack

- **Backend:** Python + FastAPI
- **Database:** PostgreSQL (via Docker)
- **Frontend:** React.js (Vite)
- **Containerization:** Docker + Docker Compose

## Core Features & Roles

- **Students:** Dashboard with club discovery, event registration, and profile management (**Student Dashboard** Active).
- **Club Owners:** Manage club applications, events, and attendance via the upcoming **Club Panel**.
- **SKS Staff:** Oversee all university activities and metrics via the **SKS Panel** (Active).

## How to Run

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed on your machine.

### Steps

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd campus-hub
   ```

2. Copy the environment file and fill in your values:
   ```bash
   cp backend/.env.example backend/.env
   ```

3. Build and start all services:
   ```bash
   docker-compose up --build
   ```

4. If you pull new updates with schema changes, run the manual database migration script (this ensures missing columns like 'grade' are added without losing data):
   ```bash
   docker-compose exec backend python migrate.py
   ```

5. The API will be available at: [http://localhost:8000](http://localhost:8000)

5. Interactive API docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
