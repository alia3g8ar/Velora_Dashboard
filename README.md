<div align="center">
  <img src="frontend/public/logo-w715.webp" alt="Velora CRM" width="400" style="border-radius: 12px; margin: 20px 0;" />
</div>

<h1 align="center">🌟 Velora CRM</h1>

<p align="center">
  <strong>Self-Contained Full-Stack CRM Dashboard with Modern Design & Powerful Features</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

## ✨ About Velora

**Velora** is a self-contained full-stack CRM dashboard. A React + Refine frontend talks over GraphQL to its own NestJS API, which persists data in MySQL through TypeORM. The frontend no longer depends on any external demo API — every number on the dashboard comes from the project's own database.

### 🎯 Why Choose Velora?

- 🎨 **Modern Design**: Beautiful purple-pink gradient theme with dark UI
- ⚡ **High Performance**: Built with React 18+ and Vite for optimal speed
- 🔐 **Secure**: Real authentication — bcrypt-hashed passwords and JWT access tokens
- 🗄️ **Own Data**: Every chart, statistic and list is backed by the project's MySQL database
- 🔄 **GraphQL Everywhere**: Filtering, sorting, pagination and aggregates through a single typed API
- 📱 **Fully Responsive**: Perfect experience across all devices

### 🏢 Perfect For:
- **B2B Applications** - Scale your business operations
- **Internal Tools** - Streamline team workflows
- **Admin Panels** - Manage everything from one place
- **Dashboards** - Visualize data beautifully
- **CRUD Applications** - Full data management capabilities

## 🛠️ Tech Stack

<table>
<tr>
<td align="center">⚛️<br><strong>React 18+</strong></td>
<td align="center">🟦<br><strong>TypeScript</strong></td>
<td align="center">⚡<br><strong>Vite</strong></td>
<td align="center">🧩<br><strong>Refine</strong></td>
</tr>
<tr>
<td align="center">🐜<br><strong>Ant Design</strong></td>
<td align="center">🔷<br><strong>GraphQL</strong></td>
<td align="center">🦅<br><strong>NestJS</strong></td>
<td align="center">🗄️<br><strong>TypeORM + MySQL</strong></td>
</tr>
<tr>
<td align="center">🔐<br><strong>JWT + bcrypt</strong></td>
<td align="center">✅<br><strong>class-validator</strong></td>
<td align="center">⚙️<br><strong>GraphQL Codegen</strong></td>
<td align="center">🌐<br><strong>i18next + RTL</strong></td>
</tr>
<tr>
<td align="center">🎨<br><strong>Custom Theme</strong></td>
<td align="center">📅<br><strong>Jalali Calendar</strong></td>
<td align="center">🕹️<br><strong>Ant Design 5</strong></td>
<td align="center">⚡<br><strong>Vite 5</strong></td>
</tr>
</table>

## 🏗️ Architecture

GraphQL is the contract between the two applications. The frontend's Refine data provider issues the queries and mutations the UI needs, and the backend implements them against its own schema.

```text
React + Refine
      ↓  GraphQL (Apollo client)
NestJS GraphQL API
      ↓  TypeORM
MySQL
```

## 📁 Project Structure

```text
Velora_Dashboard/
├── frontend/     React + Vite + Refine application (UI, routes, providers, GraphQL types)
├── backend/      NestJS API (entities, resolvers, auth, migration, seed)
├── package.json  Root-level command orchestration only
├── README.md
└── .gitignore
```

## 🚀 Features

<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Authentication** | Email/password login with JWT (bcrypt-hashed passwords) | ✅ Ready |
| 📊 **Dashboard** | Company/contact/deal statistics, deals chart, upcoming events & latest activities | ✅ Ready |
| 🏢 **Companies** | Full CRUD with search, filtering, sorting & pagination | ✅ Ready |
| 💰 **Deals** | Deal stages, values, close dates & per-company revenue aggregates; create/edit/delete deals right on the company page | ✅ Ready |
| 👥 **Contacts** | Contact records linked to companies with status & stage — full add/edit/delete from the company page | ✅ Ready |
| 🌐 **Bilingual (EN/FA)** | Complete English & Persian UI with true RTL, a language switcher on the login page & header, persisted choice | ✅ Ready |
| 📅 **Jalali Calendar** | Shamsi calendar & Persian dates in the Persian UI, Gregorian in English — stored data always stays Gregorian | ✅ Ready |
| 📋 **Kanban Board** | Drag & drop between task stages with user assignment, due dates & checklists | ✅ Ready |
| ⚙️ **Account Settings** | Profile management from the user menu | ✅ Ready |
| 📝 **Audit Trail** | Real activity records written by the backend on deal changes | ✅ Ready |
| 🎨 **Custom Theme** | Purple-pink gradient with dark mode | ✅ Ready |
| 📱 **Responsive Design** | Perfect on all devices & screen sizes | ✅ Ready |

</div>

<br>

## 🌐 Localization & RTL

Velora is fully bilingual (English & Persian) and switches **live without a page reload**:

- **Language switcher** on the login page and in the app header — the choice persists in `localStorage` (`velora.locale`) and defaults to English
- **Persian mode** sets `lang="fa"` + `dir="rtl"` on `<html>`, flips Ant Design to `fa_IR` with a true RTL layout, and opens the date pickers as a **Shamsi (Jalali) calendar** with Persian months, year and weekday order
- **English mode** keeps `lang="en"` + `dir="ltr"` and the standard Gregorian calendar
- **Stored data never changes with the language** — dates are always persisted as Gregorian and only formatted per locale (e.g. `۱۴۰۵/۰۵/۱۵` ↔ `2026-08-06`)
- **Business data is never translated** — company names, emails, phone numbers and user-created content stay exactly as stored; only UI labels are localized

## 🏃 Running Locally

Requirements: **Node.js 20+**, **npm**, and a running **MySQL 8+** server.

### Backend

```bash
cd backend
cp .env.example .env        # fill in MySQL credentials + JWT_SECRET
npm install
npm run migration:run       # create the CRM schema
npm run seed:demo           # load realistic demo data
npm run start:dev           # GraphQL API on http://localhost:3001
```

### Frontend

```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:3001 (already the default)
npm install
npm run dev                 # Vite dev server on http://localhost:5173
```

Open http://localhost:5173.

## 🔑 Demo Credentials

```
Email: jim.halpert@dundermifflin.com
Password: demodemo
```

## 🧰 Root Commands

From the repository root:

| Command | Purpose |
|---------|---------|
| `npm run dev:frontend` | Start the Vite dev server |
| `npm run dev:backend` | Start the NestJS API (watch mode) |
| `npm run build` | Build frontend, then backend |
| `npm run build:frontend` / `build:backend` | Build a single app |
| `npm run lint:frontend` / `lint:backend` | Lint a single app |
| `npm run typecheck` | `tsc --noEmit` for both apps |
| `npm run codegen` | Regenerate frontend GraphQL types |
| `npm run migration:run` / `migration:show` | Apply / inspect migrations |
| `npm run migration:deploy` | Apply migrations (used during production build) |
| `npm run seed` | Reseed demo data (replaces the whole DB) |
| `npm run seed:demo-user` | Create the demo user + stages/categories if missing (idempotent, never touches business data) |
| `npm run test:frontend` | Run frontend unit tests |

## 📄 Environment Variables

Environment files stay separated per app and are never committed:

- `frontend/.env.example` — `VITE_API_URL` (backend base URL) and optional `VITE_WS_URL` for realtime
- `backend/.env.example` — `JWT_SECRET`, MySQL connection, `SYNCHRONIZE`, optional `DB_SSL_*`, `FRONTEND_URL` (CORS origin) and `BACKEND_PORT`

## ☁️ Vercel Deployment

The repository is configured for **Vercel Services** — one project, two services, one domain. All routing lives in the root `vercel.json`:

```text
/              → frontend service (Vite)
/companies     → frontend service (SPA fallback to index.html)
/tasks         → frontend service
/graphql       → backend service (NestJS)
```

- Frontend service root: `frontend` (framework `vite`)
- Backend service root: `backend` (framework `nestjs`)
- `/graphql` and `/graphql/*` route to the backend; every other path goes to the frontend
- In the Vercel project settings, set the framework preset to **Services**

In production builds the frontend calls the API through the **same origin** (`/graphql`), so no `VITE_API_URL` is required — Preview deployments work automatically. Set `VITE_API_URL` only if you intentionally point the frontend at an external API domain.

Backend secrets are entered through **Vercel Environment Variables** (never in the repository): `JWT_SECRET`, `TYPE_DB`, `HOST_DB`, `PORT_DB`, `USERNAME_DB`, `PASSWORD_DB`, `DATABASE_DB`, `AUTOLOADENTITIES`, `SYNCHRONIZE=false`, plus optional `DB_SSL_ENABLED` / `DB_SSL_CA_BASE64` for a managed TLS database (e.g. Aiven). With `DB_SSL_ENABLED=true`, the connection is encrypted; adding `DB_SSL_CA_BASE64` (Base64 of the CA certificate) also enables certificate verification. Migrations and the demo login are applied automatically during every production build (via `migration:deploy` and `seed:demo-user`), so the database stays in sync with the code and the demo credentials below always work — both scripts are idempotent and never touch existing business data.

## GraphQL

The local development endpoint is http://localhost:3001/graphql (GraphQL Playground enabled); in production it is the same-origin `/graphql` on your Vercel domain. Authentication uses a Bearer JWT in the `Authorization` header.

Realtime subscriptions are optional and stay disabled unless `VITE_WS_URL` is set — CRUD works through plain refetch after mutations.

<br>

<p align="center"><strong>Made with 💜 for the Velora CRM project</strong></p>
