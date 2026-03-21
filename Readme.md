# Campus Hub

A closed-loop SaaS ecosystem for university student communities. Campus Hub connects students, clubs, vendors, and university staff in a single platform — enabling event management, marketplace transactions, and community collaboration.

## Tech Stack

- **Backend:** Python + FastAPI
- **Database:** PostgreSQL (via Docker)
- **Frontend:** React.js *(coming soon)*
- **Containerization:** Docker + Docker Compose

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

4. The API will be available at: [http://localhost:8000](http://localhost:8000)

5. Interactive API docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
