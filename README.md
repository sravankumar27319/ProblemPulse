<div align="center">

# ⚡ ProblemPulse
### Modern Civic Problem Reporting & Municipal Resolution Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

<p align="center">
  A full-stack, state-machine driven civic intelligence system that bridges the gap between citizens and municipal authorities with real-time geospatial tracking, automated algorithmic priority triage, and a dual-verification resolution loop.
</p>

[Key Features](#-key-features) •
[System Architecture](#-system-architecture) •
[Engineering Highlights](#-engineering-highlights) •
[Tech Stack](#-tech-stack) •
[API Reference](#-api-reference) •
[Getting Started](#-getting-started) •
[Testing](#-testing--quality-assurance)

---

</div>

## 📌 Executive Summary

Municipal issue tracking systems frequently suffer from redundant complaints, lack of transparent priority allocation, opaque resolution cycles, and zero citizen verification.

**ProblemPulse** re-engineers civic problem management with:
- **Deterministic 8-Stage Finite State Machine (FSM):** Enforces strict lifecycle transitions with an immutable audit timeline.
- **Weighted Algorithmic Priority Engine:** Computes dynamic triage scores from civic severity, population density impact, report frequencies, and community endorsements with anti-sybil caps.
- **Dual-Sided Transparency:** Dedicated portals for **Citizens** (geospatial exploration, reporting, upvoting, resolution verification) and **Municipal Admins** (department routing, deduplication, photo-proof resolution, SLA tracking).
- **Geospatial Discovery:** High-performance spatial querying with coordinate bounding boxes, interactive clustering, and geocoding.

---

## 🏛️ System Architecture

```
                                  PROBLEMPULSE PLATFORM
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼                                             ▼
            citizen platform                               municipal platform
          (Next.js App Router)                           (Admin Operations)
                     │                                             │
      ┌──────────────┼──────────────┐               ┌──────────────┼──────────────┐
      ▼              ▼              ▼               ▼              ▼              ▼
 Geospatial Feed  Reporting Hub  My Activity     Triage Console Department SLA  Analytics
 (Map & Trends)  (Media + Geo)  (Vote & Track)  (Verify/Reject)  (Assign/Dept) (Resolution)
      │              │              │               │              │              │
      └──────────────┴───────┬──────┘               └──────┬───────┴──────────────┘
                             │                             │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                           REST API GATEWAY & AUTH (JWT + RBAC)
                                            │
                      ┌─────────────────────┼─────────────────────┐
                      ▼                     ▼                     ▼
             Priority Algorithm      FSM Transition Engine   Cloudinary Media
             (Weighted Scoring)       (State Enforcer)       (CDN Pipeline)
                      └─────────────────────┬─────────────────────┘
                                            │
                                            ▼
                               PostgreSQL (Prisma ORM)
                      [Spatial Indexes • Audit Log • Relations]
```

---

## 🔄 Problem Lifecycle Finite State Machine

Every civic issue moves through a formal state machine preventing unauthorized state jumps and maintaining complete auditability:

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED : Citizen submits issue
    SUBMITTED --> UNDER_REVIEW : Admin begins triage
    
    UNDER_REVIEW --> REJECTED : Insufficient details / Invalid
    UNDER_REVIEW --> DUPLICATE : Merged into master issue
    UNDER_REVIEW --> VERIFIED : Validated by municipal admin
    
    VERIFIED --> ASSIGNED : Routed to Department
    ASSIGNED --> IN_PROGRESS : Department starts fieldwork
    IN_PROGRESS --> RESOLVED : Admin submits photo proof & note
    
    RESOLVED --> COMMUNITY_VERIFIED : Citizens confirm fix (Vote threshold)
    RESOLVED --> REOPENED : Citizens dispute resolution
    REOPENED --> UNDER_REVIEW : Returned to review cycle
    
    COMMUNITY_VERIFIED --> CLOSED : Final administrative closure
    CLOSED --> [*]
```

---

## 💡 Engineering Highlights

### 1. 🧮 Weighted Algorithmic Priority Scoring Engine
Rather than relying on arbitrary urgency flags, ProblemPulse implements an automated scoring algorithm ($S \in [0, 100]$) calculating issue priority dynamically:

$$S_{\text{total}} = S_{\text{severity}} + S_{\text{people}} + S_{\text{reports}} + S_{\text{supports}}$$

Where:
- **Severity Score ($S_{\text{severity}}$):** Up to **40 pts** $\rightarrow \left(\frac{\text{Severity}}{10}\right) \times 40$
- **Affected Population Score ($S_{\text{people}}$):** Up to **30 pts** $\rightarrow \min\left(\frac{\text{People}}{100}, 1\right) \times 30$
- **Report Count Score ($S_{\text{reports}}$):** Up to **15 pts** $\rightarrow \min\left(\frac{\text{Reports}}{10}, 1\right) \times 15$
- **Community Support Score ($S_{\text{supports}}$):** Up to **15 pts** $\rightarrow \min\left(\frac{\text{Supports}}{50}, 1\right) \times 15$

```typescript
// Threshold Mapping
Score >= 65  => CRITICAL
Score >= 30  => MAJOR
Score <  30  => LOW
```
> **Anti-Abuse Dampening:** Each component is strictly capped to prevent Sybil attacks and vote brigading from artificially inflating priority. Administrators retain override capability via `adminPriority ?? autoPriority`.

---

### 2. 🛡️ Enterprise-Grade Security & Validation
- **Strict Role-Based Access Control (RBAC):** Token-based authentication using HTTP-only cookies and Bearer tokens with distinct privilege levels (`USER` vs `ADMIN`).
- **Comprehensive Input Sanitization:** All payload surfaces validated at runtime via **Zod** schemas with custom coercion and normalization.
- **SQL Injection & XSS Prevention:** Parameterized database interactions through Prisma ORM and sanitized user markdown/content rendering.
- **Encrypted Secrets & File Sanitization:** Multer file type and size restrictions paired with Cloudinary asset validation.

---

### 3. 📍 Spatial Optimization & Geospatial Indexing
- **Composite Coordinate Indexing:** `@@index([latitude, longitude])` for rapid radius and bounding box calculations.
- **Interactive Leaflet Map Integration:** High-performance client-side clustering and real-time geographic filtering across municipal jurisdictions.

---

## 🛠️ Tech Stack

| Layer | Technologies | Key Responsibilities |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (App Router)**, React 19 | Server & Client Components, Dynamic Routing, SSR/SSG |
| **Language** | **TypeScript 5.0 (Strict Mode)** | End-to-end type safety between client and server |
| **State & Data Fetching** | **TanStack Query (React Query)** | Intelligent caching, query invalidation, optimistic updates |
| **Form Handling & UI** | **React Hook Form**, **Zod**, Tailwind CSS | Schema-driven validation, responsive glassmorphic UI |
| **Mapping & GIS** | **Leaflet**, **React Leaflet** | Geospatial visualizer, interactive pins, geocoding |
| **Backend Engine** | **Node.js**, **Express.js** | RESTful modular micro-architecture |
| **Database & ORM** | **PostgreSQL 16**, **Prisma ORM** | Relational integrity, migrations, compound indexing |
| **Media Pipeline** | **Multer**, **Cloudinary SDK** | Secure multi-part uploads, cloud asset transformation |
| **DevOps & Containers** | **Docker**, **Docker Compose** | Multi-stage production builds and local orchestration |

---

## 📁 Repository Structure

```tree
problempulse/
├── backend/                        # Express + TypeScript API Service
│   ├── prisma/
│   │   └── schema.prisma           # Relational schema, indexes & enums
│   └── src/
│       ├── config/                 # Env parser, DB client & Cloudinary config
│       ├── middleware/             # Auth JWT, RBAC & global error interceptors
│       ├── modules/                # Domain-Driven Feature Modules
│       │   ├── admin/              # Admin actions, triage & department assignments
│       │   ├── auth/               # Registration, login & session handling
│       │   ├── media/              # Media upload controllers & storage
│       │   ├── notifications/      # User notification dispatch & polling
│       │   ├── problems/           # FSM, Priority engine, geospatial filters
│       │   └── security/           # Rate limiting & audit guards
│       ├── app.ts                  # Express application configuration
│       └── server.ts               # HTTP server bootstrap
├── frontend/                       # Next.js 15 Full-Stack Web App
│   ├── app/                        # App Router Pages & API routes
│   │   ├── admin/                  # Municipal Admin Control Panel
│   │   ├── discover/               # Citizen Feed & Filterable Explore view
│   │   ├── map/                    # Full-screen Geospatial Explorer
│   │   ├── my-activity/            # Citizen tracking & upvote history
│   │   ├── problems/[id]/          # Detailed problem view & timeline
│   │   └── report/                 # Step-by-step problem submission wizard
│   ├── components/                 # Atomic & Composite UI Components
│   ├── hooks/                      # Custom React hooks (Geo, Auth, Queries)
│   ├── services/                   # Type-safe Axios API client services
│   └── types/                      # Shared TypeScript data models
├── docker-compose.yml              # Local PostgreSQL container service
├── Dockerfile                      # Production containerization configuration
└── render.yaml                     # Cloud deployment blueprint
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** `v18.0.0+`
- **npm** `v9.0.0+`
- **Docker & Docker Compose** (for PostgreSQL)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/sravankumar27319/ProblemPulse.git
cd ProblemPulse
```

---

### Step 2: Database Setup with Docker

Start the isolated PostgreSQL instance:

```bash
docker compose up -d postgres
```

---

### Step 3: Backend Configuration & Startup

```bash
cd backend

# Create environment file
cp .env.example .env

# Install dependencies
npm install

# Run database migrations and generate Prisma Client
npx prisma db push

# Optional: Seed initial departments and demo data
npx prisma db seed

# Start development server
npm run dev
```
> The backend server will run at: `http://localhost:5000`  
> Health check: `http://localhost:5000/api/health`

---

### Step 4: Frontend Configuration & Startup

```bash
cd ../frontend

# Create environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
> The frontend application will run at: `http://localhost:3000`

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/problempulse?schema=public"
JWT_SECRET="your_ultra_secure_jwt_secret_key"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_MAP_DEFAULT_LAT=17.385044
NEXT_PUBLIC_MAP_DEFAULT_LNG=78.486671
```

---

## 🔌 API Reference

### 🔐 Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new citizen account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### 📋 Problem Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/problems` | Public | Paginated list with category, status & priority filters |
| `POST` | `/api/problems` | Citizen / Admin | Create new problem with media and geolocation |
| `GET` | `/api/problems/:id` | Public | Get full problem details, audit timeline & media |
| `POST` | `/api/problems/:id/support` | Citizen | Upvote / support an issue (updates auto-priority) |
| `POST` | `/api/problems/:id/report` | Citizen | Report duplicate or flag problem |
| `POST` | `/api/problems/:id/comments` | Authenticated | Post comment to public problem thread |
| `POST` | `/api/problems/:id/verify-resolution` | Citizen | Submit community fix verification vote |

### 🛡️ Municipal Administration
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/problems` | Admin | Filterable administrative triage queue |
| `PATCH` | `/api/admin/problems/:id/status` | Admin | Transition problem state across FSM |
| `PATCH` | `/api/admin/problems/:id/assign` | Admin | Assign problem to department & set admin priority |
| `POST` | `/api/admin/problems/:id/resolve` | Admin | Mark problem resolved with photo proof |
| `GET` | `/api/admin/analytics` | Admin | Aggregate resolution times, department metrics & heatmaps |

---

## 🧪 Testing & Quality Assurance

ProblemPulse includes comprehensive test suites covering unit logic, priority scoring, state transitions, security, and integration:

```bash
cd backend

# Run entire test suite
npm test

# Run specific domain test suites
npm run test:priority     # Tests priority scoring & anti-sybil caps
npm run test:fsm          # Tests state machine rules & transitions
npm run test:security     # Tests RBAC and input validation guards
```

---

## 🚢 Deployment Architecture

The system is configured for containerized continuous deployment:

```bash
# Build production Docker image
docker build -t problempulse-api:latest .

# Run production container with environment config
docker run -p 5000:5000 --env-file ./backend/.env problempulse-api:latest
```

---

## 👥 Authors & Contributors

- **Sravan Kumar** — Lead Full-Stack Architect & Engineering — [@sravankumar27319](https://github.com/sravankumar27319)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
