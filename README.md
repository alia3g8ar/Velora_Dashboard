# Velora CRM

Velora is a self-contained full-stack CRM dashboard. A React + Refine frontend talks over GraphQL to its own NestJS API, which persists data in MySQL through TypeORM. The frontend no longer depends on any external demo API — every number on the dashboard comes from the project's own database.

## Features

- **CRM dashboard** — company, contact and deal statistics; deals chart; upcoming events; latest activities feed
- **Companies** — searchable list with filtering, sorting and pagination; create, edit and delete; per-company deal revenue aggregates
- **Deals** — deal stages (NEW → QUALIFIED → PROPOSAL → WON / LOST), values, close dates, and month/year revenue aggregates for the dashboard chart
- **Contacts** — contact records linked to companies with status and stage
- **Tasks / Kanban** — task stages (TODO, IN PROGRESS, IN REVIEW, DONE), user assignment, due dates, descriptions, checklists and completed state; full create/edit/delete
- **Events** — upcoming events rendered on the dashboard
- **Audit trail** — real activity records written by the backend whenever a deal is created or changed
- **Authentication** — email/password login, bcrypt-hashed passwords, JWT access tokens, protected GraphQL operations
- **GraphQL API** — filtering, sorting, offset pagination, `totalCount` and aggregates throughout
- **Demo seed data** — a realistic dataset so the app looks populated on first run

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Refine
- Ant Design
- GraphQL (nestjs-query data provider)
- GraphQL Code Generator

### Backend

- NestJS 11
- TypeScript
- GraphQL (Apollo, @nestjs/graphql, nestjs-query)
- TypeORM
- MySQL
- JWT
- bcrypt
- class-validator

## Architecture

GraphQL is the contract between the two applications: the frontend's Refine data provider issues the same queries/mutations the original demo API accepted, and the backend implements them against its own schema.

```text
React + Refine
      ↓  GraphQL (Apollo client)
NestJS GraphQL API
      ↓  TypeORM
MySQL
```

## Project Structure

```text
Velora_Dashboard/
├── frontend/     React + Vite + Refine application (UI, routes, providers, GraphQL types)
├── backend/      NestJS API (entities, resolvers, auth, migration, seed)
├── package.json  Root-level command orchestration only
├── README.md
└── .gitignore
```

## Getting Started

Requirements: Node.js 20+, npm, and a running MySQL 8+ server.

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

## Environment Variables

Environment files are separated per app and never committed. Copy each example to `.env` and adjust:

- `frontend/.env.example` — `VITE_API_URL` (backend base URL, GraphQL endpoint is `<VITE_API_URL>/graphql`) and optional `VITE_WS_URL` for realtime
- `backend/.env.example` — `JWT_SECRET`, MySQL connection (`TYPE_DB`, `HOST_DB`, `PORT_DB`, `USERNAME_DB`, `PASSWORD_DB`, `DATABASE_DB`), `SYNCHRONIZE`, optional `DB_SSL_*`, `FRONTEND_URL` (CORS origin) and `BACKEND_PORT`

## Database Setup

Create the database (default name `velora_crm`), then from the repository root:

```bash
npm run migration:run   # create the CRM schema
npm run seed            # load realistic demo data
```

Migrations are the source of truth; `SYNCHRONIZE` stays `false` except during local experimentation.

## Running Development

From the repository root:

```bash
npm run dev:backend     # NestJS API on http://localhost:3001 (watch mode)
npm run dev:frontend    # Vite dev server on http://localhost:5173
```

Or directly in each app:

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Demo Account

The seed script creates an intentionally public demo account:

```
Email:    jim.halpert@dundermifflin.com
Password: demodemo
```

## Useful Commands

All run from the repository root:

| Command                | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `npm run dev:frontend` | Start the Vite dev server                 |
| `npm run dev:backend`  | Start the NestJS API (watch mode)         |
| `npm run build`        | Build frontend, then backend              |
| `npm run build:frontend` / `build:backend` | Build a single app      |
| `npm run lint:frontend` / `lint:backend`  | Lint a single app        |
| `npm run typecheck`    | `tsc --noEmit` for both apps              |
| `npm run codegen`      | Regenerate frontend GraphQL types         |
| `npm run migration:run` / `migration:show` | Apply / inspect migrations |
| `npm run seed`         | Reseed demo data                          |
| `npm run test:frontend`| Run frontend unit tests                   |

## GraphQL

The local development endpoint is `http://localhost:3001/graphql` (GraphQL Playground enabled). The frontend connects to it via `VITE_API_URL`; authentication uses a Bearer JWT in the `Authorization` header.

## Build

```bash
npm run build
```

Produces `frontend/dist` and `backend/dist`.

## Notes

Seed data exists purely for development and portfolio demonstration. Realtime subscriptions are optional and stay disabled unless `VITE_WS_URL` is set — CRUD works through plain refetch after mutations.
