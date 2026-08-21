# RecruitPro — Enterprise Job Recruitment Platform

A production-grade, multi-tenant SaaS recruitment platform built with Angular, NestJS, PostgreSQL, Redis, and Docker.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Frontend                     │
│              (Angular 19 · Material · SCSS)              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                    NestJS API                            │
│         (REST · JWT · RBAC · Swagger · BullMQ)           │
└─────┬──────────┬──────────┬──────────┬──────────────────┘
      │          │          │          │
  ┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
  │ Postgres│ │ Redis │ │  S3   │ │BullMQ │
  │  (ORM)  │ │(Cache)│ │(Files)│ │(Queue)│
  └─────────┘ └───────┘ └───────┘ └───────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 19, Angular Material, RxJS, SCSS |
| Backend | NestJS 11, Express 5, TypeScript |
| Database | PostgreSQL 16, Prisma 5 ORM |
| Cache | Redis 7 |
| Queue | BullMQ |
| Auth | JWT + Refresh Token Rotation |
| Docs | Swagger/OpenAPI |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Project Structure

```
recruitment-platform/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Angular frontend
├── libs/
│   └── shared/       # Shared TypeScript interfaces & enums
├── docker/           # Dockerfiles & nginx config
├── .env.example      # Environment variable template
└── docker-compose.yml
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

### 1. Clone and install

```bash
git clone <repository-url>
cd recruitment-platform

# Install backend
cd apps/api && npm install

# Install frontend
cd ../web && npm install
```

### 2. Start infrastructure

```bash
# From project root — starts PostgreSQL, Redis, MailHog
docker compose up postgres redis mailhog -d
```

### 3. Set up database

```bash
cd apps/api

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx ts-node prisma/seed.ts
```

### 4. Start development servers

```bash
# Terminal 1 — Backend (port 3000)
cd apps/api && npm run start:dev

# Terminal 2 — Frontend (port 4200)
cd apps/web && npm start
```

### 5. Access

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/docs |
| Health | http://localhost:3000/health |
| MailHog | http://localhost:8025 |

## Test Accounts

All accounts use password: `Password123!`

| Role | Email |
|------|-------|
| Platform Admin | admin@recruitpro.com |
| Recruiter (TechCorp) | sarah@techcorp.example.com |
| Recruiter (DesignStudio) | james@designstudio.example.com |
| Candidate | alex@example.com |
| Candidate | maria@example.com |

## Environment Variables

Copy `.env.example` to `.env.development` and configure. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | See .env.example |
| REDIS_HOST | Redis hostname | localhost |
| JWT_ACCESS_SECRET | JWT signing secret | Change in production! |
| FRONTEND_URL | Angular app URL | http://localhost:4200 |

## API Documentation

Interactive Swagger documentation available at `/docs` when running in development mode.

### Response Format

All API responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "perPage": 20, "total": 100, "totalPages": 5 },
  "requestId": "uuid"
}
```

## Development Phases

- [x] **Phase 1** — Foundation (project structure, database, health, Swagger)
- [ ] **Phase 2** — Identity (auth, JWT, RBAC, permissions)
- [ ] **Phase 3** — Companies & Profiles
- [ ] **Phase 4** — Jobs (CRUD, search, lifecycle)
- [ ] **Phase 5** — Applications & Pipeline
- [ ] **Phase 6** — Interviews & Feedback
- [ ] **Phase 7** — Offers
- [ ] **Phase 8** — Notifications & Messaging
- [ ] **Phase 9** — Analytics
- [ ] **Phase 10** — Subscriptions
- [ ] **Phase 11** — Production Hardening
- [ ] **Phase 12** — CI/CD & Deployment

## License

Proprietary — All rights reserved.
