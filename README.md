# ProblemPulse

ProblemPulse is a civic problem reporting and municipal resolution tracking platform. It connects citizens (**USER**) with municipal authorities (**ADMIN**) on a single problem-lifecycle state machine backed by a shared database.

---

## Architecture Overview

```
                         PROBLEMPULSE
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ↓                                 ↓
        USER PLATFORM                    ADMIN PLATFORM
             │                                 │
    ┌────────┼────────┐              ┌─────────┼─────────┐
    ↓        ↓        ↓              ↓         ↓         ↓
 Discover   Report   Activity       Review   Manage    Analytics
    │        │        │              │         │         │
    ↓        ↓        ↓              ↓         ↓         ↓
 Feed       Media   My Reports     Verify    Assign    Insights
 Map        Location Supports      Reject    Track
 Trending   Details Notifications  Duplicate Resolve
    │        │        │              │         │
    └────────┴────────┘              └─────────┴─────────┘
             │                                 │
             └──────────────┬──────────────────┘
                            ↓
                    Problem Lifecycle
                            │
   SUBMITTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS
                            ↓
                        RESOLVED
                            ↓
                   COMMUNITY_VERIFIED
                            ↓
                         CLOSED
```

### Problem Lifecycle State Transitions

* Primary flow: `SUBMITTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → COMMUNITY_VERIFIED → CLOSED`
* Alternate transitions:
  * `UNDER_REVIEW → REJECTED` (requires reason)
  * `UNDER_REVIEW → DUPLICATE` (linked to existing problem)
  * `RESOLVED → REOPENED` (sends back to admin review)

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, React 19, Tailwind CSS, React Hook Form, Zod, TanStack Query, Leaflet / React Leaflet |
| **Backend** | Node.js, Express.js, TypeScript, JWT, bcrypt, Zod, Multer, Cloudinary SDK |
| **Database** | PostgreSQL, Prisma ORM |
| **Infrastructure** | Docker, Docker Compose, Git |

---

## Project Structure

```
problempulse/
├── frontend/             # Next.js frontend web application
│   ├── app/              # App Router pages and routes
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services and HTTP clients
│   └── types/            # TypeScript interfaces
├── backend/              # Node.js Express backend service
│   ├── src/              # Application source code
│   │   ├── config/       # Environment and database configuration
│   │   ├── middleware/   # Express middlewares (auth, error handling)
│   │   ├── modules/      # Feature modules (auth, problems, admin, etc.)
│   │   ├── app.ts        # Express app initialization
│   │   └── server.ts     # HTTP server entry point
│   └── prisma/           # Prisma schema and migrations
├── docker-compose.yml    # Local development database service
└── README.md             # Project documentation
```

---

## Local Development Setup

### Prerequisites

- Node.js (v18+)
- npm (v9+)
- Docker Desktop (for local PostgreSQL)

### 1. Database Setup

Start local PostgreSQL instance:

```bash
docker compose up -d postgres
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env     # Update database and environment variables
npm install
npx prisma db push       # Sync database schema
npm run dev              # Starts dev server on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev              # Starts Next.js dev server on http://localhost:3000
```

---

## API Health Check

Verify backend is running:

```bash
curl http://localhost:5000/api/health
```
