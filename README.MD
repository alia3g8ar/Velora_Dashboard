<div align="center">
  <img src="https://via.placeholder.com/1200x300/6D28D9/FFFFFF?text=VELORA+CRM+DASHBOARD" alt="Velora CRM Dashboard" width="100%" style="border-radius: 15px; margin: 20px 0;" />
</div>

<h1 align="center">🌟 Velora CRM Dashboard</h1>

<p align="center">
  <strong>Next-Generation CRM Dashboard with Modern Design & Powerful Features</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white" />
  <img src="https://img.shields.io/badge/Ant_Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white" />
</p>

## ✨ About Velora

**Velora** is a cutting-edge, enterprise-grade CRM dashboard with a stunning purple-pink gradient theme. It is a **self-contained full-stack application**: the React/Refine frontend talks to its own NestJS GraphQL backend over TypeORM, backed by MySQL. No external CRM API is involved.

### 🏗️ Architecture

```
React / Refine frontend
        ↓  GraphQL (Apollo, nestjs-query data provider)
NestJS GraphQL backend  (backend/)
        ↓  TypeORM
MySQL database
```

### 🎯 Why Choose Velora?

- 🎨 **Modern Design**: Beautiful purple-pink gradient theme with dark UI
- ⚡ **High Performance**: Built with React 18+ and TypeScript for optimal speed
- 🔐 **Secure**: Real authentication — bcrypt-hashed passwords, JWT access tokens
- 🗄️ **Own Data**: Every number on the dashboard comes from your MySQL database
- 🌐 **Multi-language**: Built-in English/Persian language support with RTL
- 📱 **Fully Responsive**: Perfect experience across all devices

## 🛠️ Tech Stack

<table>
<tr>
<td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="50" height="50"/><br><strong>React 18+</strong></td>
<td align="center"><img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="50" height="50"/><br><strong>TypeScript</strong></td>
<td align="center"><img src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" width="50" height="50"/><br><strong>Ant Design</strong></td>
<td align="center"><img src="https://vitejs.dev/logo.svg" width="50" height="50"/><br><strong>Vite</strong></td>
</tr>
<tr>
<td align="center">🦅<br><strong>NestJS</strong></td>
<td align="center">🔷<br><strong>GraphQL</strong></td>
<td align="center">🗄️<br><strong>TypeORM + MySQL</strong></td>
<td align="center">🔐<br><strong>JWT + bcrypt</strong></td>
</tr>
</table>

## 🚀 Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **Authentication** | Email/password login with JWT (bcrypt-hashed passwords) | ✅ Ready |
| 📊 **Dashboard** | Company/contact/deal counts, deals chart, upcoming events, latest activities — all from the database | ✅ Ready |
| 🏢 **Companies** | Complete CRUD with search, filtering, sorting, pagination and deal revenue aggregates | ✅ Ready |
| 📋 **Kanban Board** | Task stages with drag-free card management, due dates, descriptions, user assignment | ✅ Ready |
| 📝 **Audit / Activities** | Real audit records written by the backend on deal changes | ✅ Ready |
| 🎨 **Custom Theme** | Purple-pink gradient with dark mode | ✅ Ready |

## 🏃 Running Locally

### 1. Database (MySQL)

Create a database (default name `velora_crm`), then configure and migrate the backend.

### 2. Backend (`backend/`)

```bash
cd backend
cp .env.example .env        # fill in MySQL credentials + JWT_SECRET
npm install
npm run migration:run       # create the schema
npm run seed:demo           # load realistic demo data
npm run start:dev           # GraphQL API on http://localhost:3001
```

### 3. Frontend (repo root)

```bash
cp .env.example .env        # VITE_API_URL=http://localhost:3001 (already the default)
npm install
npm run dev                 # Vite dev server on http://localhost:5173
```

Open http://localhost:5173.

### 🔑 Demo Credentials

```
Email: jim.halpert@dundermifflin.com
Password: demodemo
```

## 📄 Environment Files

- Frontend `.env` — see `.env.example` (`VITE_API_URL`, optional `VITE_WS_URL`).
- Backend `backend/.env` — see `backend/.env.example` (MySQL connection, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_PORT`).

Realtime (GraphQL WebSocket) is optional; without `VITE_WS_URL` the app uses plain refetch after mutations.

## 🧪 Quality Checks

```bash
# Frontend
npm run build               # production build
npx tsc --noEmit            # typecheck

# Backend (in backend/)
npm run build               # nest build
npx tsc --noEmit            # typecheck
```
