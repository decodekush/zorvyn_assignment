# Finance Data Processing and Access Control Backend

A clean, maintainable Node.js + TypeScript backend for a role-based finance dashboard. Built with Express, Prisma ORM, and SQLite.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [API Reference](#api-reference)
- [Access Control Matrix](#access-control-matrix)
- [Feature Checklist](#feature-checklist)
- [Design Decisions & Assumptions](#design-decisions--assumptions)

---

## Architecture Overview

The backend follows a **layered architecture** with clear separation of concerns:

```
Request → Routes → Middleware (Auth + RBAC) → Controllers → Prisma ORM → SQLite
```

Each layer has a single responsibility:

| Layer           | Responsibility                                     |
| --------------- | -------------------------------------------------- |
| **Routes**      | Map HTTP verbs + paths to controller handlers      |
| **Middleware**   | JWT authentication, role-based guards, error catch |
| **Controllers** | Request parsing, business logic, response shaping  |
| **Schemas**     | Input validation via Zod at the request boundary   |
| **Utils**       | Shared constants, Prisma client singleton          |

---

## Tech Stack

| Tool              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| **Node.js**       | Runtime                                          |
| **Express 5**     | HTTP framework                                   |
| **TypeScript**    | Type safety across the entire codebase           |
| **Prisma ORM**    | Type-safe database queries and schema management |
| **SQLite**        | Lightweight, file-based relational database      |
| **Zod**           | Runtime input validation with detailed errors    |
| **JWT**           | Token-based authentication                       |
| **bcryptjs**      | Password hashing (salt rounds = 10)              |

---

## Project Structure

```
src/
├── index.ts                  # App entry point — middleware, routes, server start
├── seed.ts                   # Seeds demo users (admin, analyst, viewer)
│
├── controllers/
│   ├── authController.ts     # Register and login endpoints
│   ├── userController.ts     # User listing, role/status management
│   ├── recordController.ts   # CRUD + filtering for financial records
│   └── dashboardController.ts# Aggregated analytics endpoints
│
├── middlewares/
│   ├── authMiddleware.ts     # JWT verification, attaches user to request
│   ├── roleMiddleware.ts     # Role-based access guard (factory pattern)
│   └── errorMiddleware.ts    # Centralized error handler (Zod, Prisma, generic)
│
├── routes/
│   ├── authRoutes.ts         # POST /register, /login
│   ├── userRoutes.ts         # Admin-only user management routes
│   ├── recordRoutes.ts       # Financial record CRUD routes
│   └── dashboardRoutes.ts    # Analytics/summary routes
│
├── schemas/
│   ├── authSchema.ts         # Zod schemas for register, login, role/status update
│   └── recordSchema.ts       # Zod schemas for create, update, query records
│
└── utils/
    ├── constants.ts          # Role, Status, RecordType constants + types
    └── prisma.ts             # Prisma client singleton

prisma/
└── schema.prisma             # Database schema (User + FinancialRecord models)
```

---

## Setup & Installation

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/decodekush/zorvyn_assignment.git
cd zorvyn_assignment

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env if you want to change JWT_SECRET or PORT

# 4. Initialize the database
npm run db:setup         # Generates Prisma client + pushes schema to SQLite

# 5. Seed demo users (optional but recommended)
npm run seed             # Creates: admin/admin123, analyst/analyst123, viewer/viewer123

# 6. Start the development server
npm run dev              # Runs on http://localhost:3000
```

### Available Scripts

| Script           | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `npm run dev`    | Start in development mode with hot-reload (nodemon)    |
| `npm run build`  | Compile TypeScript to `dist/`                          |
| `npm start`      | Run compiled production build                          |
| `npm run seed`   | Create demo users for each role                        |
| `npm run db:setup` | Generate Prisma client and push schema to database   |

---

## API Reference

All endpoints return JSON with a consistent shape:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "What went wrong",
  "details": [{ "field": "amount", "message": "Must be positive" }]
}
```

### Authentication

| Method | Endpoint              | Auth | Description                                 |
| ------ | --------------------- | ---- | ------------------------------------------- |
| POST   | `/api/auth/register`  | No   | Register a new user (always starts as VIEWER) |
| POST   | `/api/auth/login`     | No   | Login and receive a JWT token               |

**Register:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "password": "pass123"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Returns a JWT token — use it as `Authorization: Bearer <token>` on all protected routes.

---

### User Management (Admin Only)

| Method | Endpoint                   | Roles | Description                      |
| ------ | -------------------------- | ----- | -------------------------------- |
| GET    | `/api/users`               | Admin | List all users (no passwords)    |
| PUT    | `/api/users/:id/role`      | Admin | Change user role                 |
| PUT    | `/api/users/:id/status`    | Admin | Activate/deactivate a user       |

**Update role:**

```bash
curl -X PUT http://localhost:3000/api/users/<id>/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "ANALYST"}'
```

**Update status:**

```bash
curl -X PUT http://localhost:3000/api/users/<id>/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}'
```

Allowed roles: `VIEWER`, `ANALYST`, `ADMIN`  
Allowed statuses: `ACTIVE`, `INACTIVE`

---

### Financial Records

| Method | Endpoint            | Roles          | Description                        |
| ------ | ------------------- | -------------- | ---------------------------------- |
| GET    | `/api/records`      | Analyst, Admin | List records (filtered, paginated) |
| GET    | `/api/records/:id`  | Analyst, Admin | Get a single record by ID          |
| POST   | `/api/records`      | Admin          | Create a new record                |
| PUT    | `/api/records/:id`  | Admin          | Update an existing record          |
| DELETE | `/api/records/:id`  | Admin          | Soft-delete a record               |

**Create a record:**

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "type": "INCOME",
    "category": "Salary",
    "date": "2025-03-01",
    "notes": "March salary"
  }'
```

**Query records with filters:**

```bash
# Filter by type + date range + search + pagination
curl "http://localhost:3000/api/records?type=INCOME&startDate=2025-01-01&endDate=2025-12-31&search=Salary&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

**Supported query parameters:**

| Param       | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `type`      | string | `INCOME` or `EXPENSE`               |
| `category`  | string | Exact category match                |
| `search`    | string | Search in category and notes fields |
| `startDate` | string | ISO date, inclusive lower bound      |
| `endDate`   | string | ISO date, inclusive upper bound      |
| `page`      | number | Page number (default: 1)            |
| `limit`     | number | Records per page (default: 20, max: 100) |

---

### Dashboard / Analytics

| Method | Endpoint                         | Roles                | Description                     |
| ------ | -------------------------------- | -------------------- | ------------------------------- |
| GET    | `/api/dashboard/summary`         | Viewer, Analyst, Admin | Total income, expenses, net balance |
| GET    | `/api/dashboard/category-totals` | Viewer, Analyst, Admin | Totals grouped by category      |
| GET    | `/api/dashboard/recent`          | Viewer, Analyst, Admin | 10 most recent records          |
| GET    | `/api/dashboard/monthly-trends`  | Viewer, Analyst, Admin | Income/expense by month         |

**Summary response example:**

```json
{
  "success": true,
  "data": {
    "totalIncome": 15000,
    "totalExpenses": 8500,
    "netBalance": 6500,
    "recordCount": { "income": 5, "expense": 3 }
  }
}
```

---

### Health Check

| Method | Endpoint       | Auth | Description        |
| ------ | -------------- | ---- | ------------------ |
| GET    | `/api/health`  | No   | Server status check |

---

## Access Control Matrix

| Action                  | Viewer | Analyst | Admin |
| ----------------------- | :----: | :-----: | :---: |
| View dashboard summary  |   ✅   |   ✅    |  ✅   |
| View category totals    |   ✅   |   ✅    |  ✅   |
| View recent activity    |   ✅   |   ✅    |  ✅   |
| View monthly trends     |   ✅   |   ✅    |  ✅   |
| List records            |   ❌   |   ✅    |  ✅   |
| View single record      |   ❌   |   ✅    |  ✅   |
| Create records          |   ❌   |   ❌    |  ✅   |
| Update records          |   ❌   |   ❌    |  ✅   |
| Delete records          |   ❌   |   ❌    |  ✅   |
| List users              |   ❌   |   ❌    |  ✅   |
| Change user role        |   ❌   |   ❌    |  ✅   |
| Change user status      |   ❌   |   ❌    |  ✅   |

---

## Feature Checklist

### Core Requirements

- ✅ **User and Role Management**
  - ✅ User registration with password hashing (bcrypt)
  - ✅ User login with JWT token generation
  - ✅ Three roles: VIEWER, ANALYST, ADMIN
  - ✅ Admin can list, promote/demote, and activate/deactivate users
  - ✅ Inactive users are blocked from logging in

- ✅ **Financial Records Management**
  - ✅ Full CRUD: Create, Read, Update, Delete
  - ✅ Fields: amount, type (INCOME/EXPENSE), category, date, notes
  - ✅ Filtering by type, category, date range
  - ✅ Records linked to the creating user

- ✅ **Dashboard Summary APIs**
  - ✅ Total income, total expenses, net balance
  - ✅ Category-wise totals (grouped by category + type)
  - ✅ Recent activity (last 10 records)
  - ✅ Monthly/weekly trends (income vs expense by month)

- ✅ **Access Control Logic**
  - ✅ JWT-based authentication middleware
  - ✅ Role-based authorization middleware (factory pattern)
  - ✅ Viewers: dashboard only
  - ✅ Analysts: dashboard + read records
  - ✅ Admins: full access to everything
  - ✅ Registration always assigns VIEWER (no privilege escalation)

- ✅ **Validation and Error Handling**
  - ✅ Zod schemas on all input boundaries
  - ✅ Centralized error handler (Zod errors → 400, Prisma not found → 404, unique constraint → 409)
  - ✅ Consistent JSON error format with field-level details
  - ✅ Correct HTTP status codes (200, 201, 400, 401, 403, 404, 409, 500)

- ✅ **Data Persistence**
  - ✅ SQLite via Prisma ORM
  - ✅ Fully typed database queries
  - ✅ UUID primary keys
  - ✅ Automatic timestamps (createdAt, updatedAt)

### Optional Enhancements

- ✅ **Authentication** — JWT with 24h expiry, bcrypt password hashing
- ✅ **Pagination** — Page/limit support on record listing with total count + total pages
- ✅ **Search** — Text search across category and notes fields
- ✅ **Soft Delete** — Records are flagged `isDeleted = true`, never physically removed
- ✅ **Database Seeding** — One command creates demo users for all three roles
- ✅ **Health Check Endpoint** — `GET /api/health` for monitoring
- ✅ **Environment Configuration** — `.env` based config with `.env.example` template

---

## Design Decisions & Assumptions

### Architecture

- **Layered structure** (routes → middleware → controllers → ORM) keeps each file focused and testable.
- **No service layer**: For this scope, controllers directly call Prisma. In a larger app, a `services/` layer would sit between controllers and data access.

### Security

- **Registration defaults to VIEWER**: Users cannot self-assign elevated roles. Only admins can promote users via `PUT /api/users/:id/role`.
- **Inactive users cannot log in**: The login endpoint checks user status before issuing a token.
- **Passwords never returned**: All user queries explicitly exclude the password field via Prisma `select`.

### Data Modeling

- **SQLite chosen for simplicity**: Zero-config, file-based, and provides full SQL capabilities. Ideal for assessment scope while still demonstrating relational modeling.
- **Soft delete over hard delete**: Financial records are flagged rather than removed, preserving audit trail. All queries filter on `isDeleted: false`.
- **User → Records relation**: Each financial record is linked to the user who created it via `userId`.

### Validation

- **Zod at request boundaries**: Validation happens before any business logic, ensuring only clean data enters the system. This is deliberate — validation belongs at the edge, not inside business logic.
- **Partial update schema**: The update schema uses Zod `.partial()` with a refinement that at least one field must be provided — prevents empty update requests.

### API Design

- **Consistent response shape**: Every endpoint returns `{ success, data/error, message }` making client-side parsing predictable.
- **Pagination metadata**: Record listing includes `{ page, limit, total, totalPages }` so the frontend can build proper pagination controls.
- **Aggregation in the database**: Dashboard endpoints use Prisma `aggregate` and `groupBy` — the database does the math, not JavaScript (except for monthly trends where in-memory grouping is cleaner for date formatting).

### Tradeoffs

| Decision | Tradeoff |
|----------|----------|
| SQLite instead of PostgreSQL | Simpler setup, but no concurrent write scaling |
| No service layer | Less abstraction, but clearer for a small codebase |
| Soft delete only | Preserves data, but requires `isDeleted: false` in every query |
| In-memory monthly grouping | More flexible date formatting, but fetches all records |

---

## Error Response Reference

| Status | Meaning                         | Example Trigger                        |
| ------ | ------------------------------- | -------------------------------------- |
| `400`  | Validation failed               | Missing required field, invalid format |
| `401`  | Unauthorized                    | No token, expired token, bad password  |
| `403`  | Forbidden                       | VIEWER tries to create a record        |
| `404`  | Not found                       | Record ID doesn't exist                |
| `409`  | Conflict                        | Duplicate username on registration     |
| `500`  | Internal server error           | Unexpected exception                   |

---
