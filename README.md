# Finance Data Processing and Access Control Backend

This is a backend system for a finance dashboard, built with Node.js, Express, TypeScript, and Prisma (SQLite). It is designed to be clear, maintainable, and logically organized.

## Architecture

- **Controllers**: Handle request/response logic.
- **Middlewares**: Process requests (Authentication, Role-based Access, Error Handling).
- **Routes**: API path definitions.
- **Schemas**: Zod validation schemas for robust input validation.
- **Utils**: Contains the Prisma client instance.

## Technologies Used
- Node.js & Express
- TypeScript
- Prisma ORM & SQLite
- JSON Web Tokens (JWT) & bcryptjs
- Zod (Input validation)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Initialization**
   The project uses SQLite and Prisma. Run the following command to generate the client and push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_secret_key_here"
   ```

4. **Build and Run the Server**
   To start the development server:
   ```bash
   npm run dev
   ```
   Or build and run for production:
   ```bash
   npm run build
   node dist/index.js
   ```

5. **Optional: Seed an Admin User**
   To create an initial admin account (`admin` / `admin123`), run:
   ```bash
   npm run build
   node dist/seed.js
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user (defaults to VIEWER role).
- `POST /api/auth/login` - Login and get a JWT token.

### Users (Admin Only)
Requires `Authorization: Bearer <token>`
- `GET /api/users` - Get all users.
- `PUT /api/users/:id/role` - Update a user's role (`VIEWER`, `ANALYST`, `ADMIN`).
- `PUT /api/users/:id/status` - Update a user's status (`ACTIVE`, `INACTIVE`).

### Financial Records
Requires `Authorization: Bearer <token>`
- `GET /api/records` - Get records (Allowed: Analyst, Admin). Supports query filters: `type`, `category`, `startDate`, `endDate`.
- `GET /api/records/:id` - Get a specific record (Allowed: Analyst, Admin).
- `POST /api/records` - Create a record (Allowed: Admin).
- `PUT /api/records/:id` - Update a record (Allowed: Admin).
- `DELETE /api/records/:id` - Delete a record (Allowed: Admin).

### Dashboard (Analyst & Admin)
Requires `Authorization: Bearer <token>`
- `GET /api/dashboard/summary` - Get total income, total expenses, and net balance.
- `GET /api/dashboard/category-totals` - Get totals grouped by category.

## Decisions and Assumptions

- **SQLite for Persistence**: Chosen for simplicity while providing full relational DB capabilities, perfect for this assessment.
- **Validation**: Strict validation at the request boundaries using Zod ensures only clean data enters the system.
- **Error Handling**: A centralized express error handler captures Zod validation errors, unhandled exceptions, and formatted responses.
- **Prisma**: Chosen to gracefully handle database queries and migrations seamlessly while remaining fully type-safe.