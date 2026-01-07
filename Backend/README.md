# Event & Task Management — User Management Module

This repository contains a Node.js + Express user management system using MySQL, JWT authentication, bcrypt for password hashing, and role-based access control.

Quick setup

- Copy `.env.example` to `.env` and fill DB and JWT values.
- Install dependencies:

```bash
npm install
```

- Create the database and run `db/schema.sql` in your MySQL instance:

```sql
-- run the SQL in db/schema.sql to create the users table
```

- Start the server:

```bash
npm run dev
```

API Endpoints

- POST /api/auth/login — login with email/password
- POST /api/auth/register — client self-registration
- POST /api/users — create internal user (ADMIN only)
- GET /api/users — list users (ADMIN only)
- GET /api/users/:id — get user profile (self or admin)
- PUT /api/users/:id — update profile (self or admin)
- DELETE /api/users/:id — deactivate user (ADMIN only)

Notes

- Passwords are hashed with bcrypt.
- JWT tokens must be sent in `Authorization: Bearer <token>` header.
- The `DELETE` endpoint performs a soft delete by setting `status` to `inactive`.

Ready for integration with task and event modules.
