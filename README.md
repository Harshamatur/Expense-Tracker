# Veyra — Smart Expense Tracker

A production-style, role-based expense tracking application built to the
Veyra Phase 1 specification: React + Vite + Tailwind on the frontend,
Node.js + Express + MySQL on the backend, JWT auth, and strict
role-based access control (consumer vs admin).

```
veyra/
├── backend/     Express REST API (Node.js + MySQL)
└── frontend/    React SPA (Vite + Tailwind + Recharts)
```

---

## 1. Prerequisites

Install these before you start:

- **Node.js** v18 or later (v20 recommended) — [nodejs.org](https://nodejs.org)
- **MySQL** 8.x running locally, or a free cloud instance (PlanetScale,
  Railway, Aiven, etc.)
- **npm** (comes with Node.js)

Check your versions:
```bash
node -v
npm -v
mysql --version
```

---

## 2. Database setup

1. Log into MySQL and create a database + user:

```sql
CREATE DATABASE veyra_db CHARACTER SET utf8mb4;
CREATE USER 'veyra_user'@'localhost' IDENTIFIED BY 'a_strong_password_here';
GRANT ALL PRIVILEGES ON veyra_db.* TO 'veyra_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Load the schema:

```bash
mysql -u veyra_user -p veyra_db < backend/db/schema.sql
```

3. Seed default expense categories (safe — no secrets):

```bash
mysql -u veyra_user -p veyra_db < backend/db/seed.sql
```

---

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in **your own** values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=veyra_user
DB_PASSWORD=a_strong_password_here
DB_NAME=veyra_db
DB_CONNECTION_LIMIT=10

JWT_SECRET=generate_a_long_random_string_here
JWT_EXPIRES_IN=1d

CLIENT_ORIGIN=http://localhost:5173

SEED_ADMIN_EMAIL=admin@veyra.local
SEED_ADMIN_PASSWORD=pick_a_real_password_here
```

Generate a strong `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Never commit your real `.env` file.** It's already covered by
`.gitignore`.

### Create the admin account + demo data (optional but recommended)

```bash
node db/seed.js
```

This reads `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`, hashes
the password with bcrypt, and creates:
- One **admin** account (your credentials from `.env`)
- One **demo consumer** account (`demo.consumer@veyra.local`, password
  from `SEED_DEMO_PASSWORD` in `.env` or `DemoPass123!` by default) with
  a few sample expenses and a budget, so the dashboard isn't empty on
  first login.

### Start the API

```bash
npm run dev
```

The API listens on `http://localhost:5000`. Verify it's up:
```bash
curl http://localhost:5000/api/health
```

---

## 4. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` just needs the API URL (default is already correct for local dev):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 5. Logging in

- **As admin:** the email/password you set in `SEED_ADMIN_EMAIL` /
  `SEED_ADMIN_PASSWORD` (only works after running `node db/seed.js`).
- **As a regular user:** click "Sign up" on the login page and register
  a new account, or use the seeded demo consumer account.

Admins land on `/admin/dashboard` (system-wide stats + user management).
Consumers land on `/dashboard` (their own budget, expenses, and charts).

---

## 6. Project structure

### Backend (`/backend`)
```
config/db.js           MySQL connection pool
controllers/           Request handlers (thin — call services)
services/               Business logic + all SQL queries
middleware/             auth, RBAC, error handling, rate limiting
validators/              Server-side input validation
routes/                 Express routers per resource
db/schema.sql           Table definitions, FKs, indexes
db/seed.sql             Safe category seed (no secrets)
db/seed.js               Admin/demo account creation (bcrypt, env-driven)
app.js                  Express app (middleware + route wiring)
server.js               Entry point (DB check, listen, graceful shutdown)
```

### Frontend (`/frontend/src`)
```
components/    Reusable UI: Button, Input, Select, Modal, Table, Sidebar, Topbar, etc.
layouts/       DashboardLayout (sidebar+topbar shell), AuthLayout
pages/         Login, Register, Dashboard, Expenses, Budget, Profile,
               AdminDashboard, AdminUsers, NotFound, Forbidden
context/       AuthContext (global auth state)
hooks/         useAuth, useToast
services/      Axios API clients, one file per resource
routes/        ProtectedRoute, AdminRoute guards
utils/         formatCurrency, formatDate, etc.
```

---

## 7. Security notes (what's already handled)

- Passwords hashed with **bcrypt** (12 salt rounds), never stored or
  logged in plaintext.
- JWTs carry only `{ id, role }` — no PII in the token payload.
- Every expense/budget query is **scoped to the authenticated user's ID**
  server-side; the frontend never sends or trusts a user ID for
  ownership — it always comes from the verified JWT.
- Admin-only routes are protected by **both** a frontend route guard
  (UX only) **and** backend `requireRole('admin')` middleware (the real
  boundary — the frontend guard can be bypassed by anyone, the backend
  check cannot).
- All SQL uses parameterized queries (`mysql2` placeholders) — no string
  concatenation, no injection surface.
- `helmet` sets secure HTTP headers; CORS is locked to `CLIENT_ORIGIN`.
- Auth endpoints (`/login`, `/register`) are rate-limited separately
  from the rest of the API to slow down credential stuffing.
- Centralized error handling never leaks stack traces or SQL errors to
  the client — only a clean message + stable `errorCode`.

## 8. Known Phase-1 tradeoffs (documented, not oversights)

- JWT is stored in `localStorage`, not an httpOnly cookie. This is
  simpler for a Phase 1 build; an httpOnly cookie + refresh-token flow
  would be the stronger production upgrade.
- "Logout" is a client-side token discard — there's no server-side
  token revocation list yet. A user's token stays valid until it
  naturally expires (`JWT_EXPIRES_IN`, default 1 day) even after
  logging out. This is a fine tradeoff at 1-day expiry but worth
  knowing about.

---

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `ECONNREFUSED` on backend start | MySQL isn't running, or `DB_HOST`/`DB_PORT` in `.env` are wrong |
| `Access denied for user` | Check `DB_USER`/`DB_PASSWORD`, and that you ran the `GRANT` statement |
| Frontend shows network errors | Confirm the backend is running on port 5000 and `VITE_API_BASE_URL` matches |
| CORS error in browser console | `CLIENT_ORIGIN` in backend `.env` must exactly match the frontend URL (`http://localhost:5173`) |
| `JWT_SECRET is not set` crash on boot | You skipped `cp .env.example .env` in `backend/`, or forgot to fill in `JWT_SECRET` |
