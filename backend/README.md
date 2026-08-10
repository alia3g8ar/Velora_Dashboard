# Velora CRM Backend

NestJS + GraphQL (Apollo, nestjs-query) + TypeORM + MySQL backend for the Velora CRM dashboard.

## Stack

- **NestJS 11** with GraphQL (code-first schema, `src/schema.gql`)
- **@ptc-org/nestjs-query** CRUD resolvers — offset paging, filtering, sorting, `totalCount`
- **TypeORM** entities with typed relations, constraints and a checked-in migration
- **JWT auth** (bcrypt password hashing, global guard, `login` / `me` GraphQL operations)
- **Audit trail** — real `audits` records written by a TypeORM subscriber on deal create/update

## Requirements

- Node.js 20+
- MySQL 8+ running locally (see `.env`)

## Setup

```bash
cp .env.example .env   # then fill in DB credentials and JWT_SECRET
npm install
```

## Database

```bash
# Apply the migration (creates the full CRM schema)
npm run migration:run

# Inspect applied/pending migrations
npm run migration:show

# Load realistic demo data (users, companies, contacts, deals, tasks, events, audits)
npm run seed:demo
```

Migrations are the source of truth. `SYNCHRONIZE=false` in `.env`; never enable it in production.

## Run

```bash
npm run start:dev      # watch mode
npm run start          # plain
npm run start:prod     # built output (node dist/main)
```

The API listens on `BACKEND_PORT` (default 3001), GraphQL endpoint `http://localhost:3001/graphql` (GraphQL Playground enabled).

## Environment

See `.env.example` for all variables: JWT secret, MySQL connection, CORS origin (`FRONTEND_URL`), port.

## Demo login

After seeding:

```
email:    jim.halpert@dundermifflin.com
password: demodemo
```

## Scripts

| Script            | Purpose                                |
| ----------------- | -------------------------------------- |
| `migration:run`   | Apply pending migrations               |
| `migration:show`  | List executed/pending migrations       |
| `seed:demo`       | Truncate and reseed demo data          |
| `build`           | Compile to `dist/`                     |
| `lint`            | ESLint (fix)                           |
