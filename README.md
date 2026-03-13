# Private Call Demo (Collections MVP)

A full-stack private web app for launching a Retell phone call for a Collections demo.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express (inside `server/`)
- Auth: `express-session` with environment-based username/password
- Runtime: ES modules only
- Monorepo style in a single repository

## Current MVP

Implemented today:

- Single demo type: `collections`
- Login page (`/login`)
- Protected app page (`/app`)
- Session auth via backend
- Collections form fields:
  - `firstName`
  - `lastName`
  - `phone`
  - `amount`
- Backend-only Retell integration (API key never exposed to frontend)

Future-ready architecture is included for:

- Multiple demo configs
- Per-user allowed demos
- Demo-specific field metadata
- Demo-specific variable mappings and fixed variables
- Demo-specific agent selection logic

## Project Structure

```
/
  public/
  server/
    config/
      env.js
      demos.js
    middleware/
      requireAuth.js
    routes/
      auth.js
      callDemo.js
      demoConfig.js
    services/
      retellClient.js
    utils/
      buildDynamicVariables.js
      date.js
    index.js
  src/
    components/
      ProtectedRoute.jsx
    context/
      AuthContext.jsx
    pages/
      LoginPage.jsx
      AppPage.jsx
    services/
      api.js
    App.jsx
    main.jsx
  .env.example
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  README.md
```

## Environment Variables

Copy `.env.example` to `.env` and set values:

```env
PORT=8787
SESSION_SECRET=change_this
APP_LOGIN_USER=admin
APP_LOGIN_PASSWORD=changeme
RETELL_API_KEY=
RETELL_FROM_NUMBER=
RETELL_AGENT_ID=
DEFAULT_COMPANY_NAME=Collection Expertise
DEFAULT_DUE_DATE=2026-03-20
```

## Install

```bash
npm install
```

## Local Development

Run frontend + backend together:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8787`
- Vite proxy forwards `/api/*` to backend

## Production Build and Run

Build frontend:

```bash
npm run build
```

Run server (serves API and built frontend):

```bash
npm run start
```

## API Endpoints

- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`
- `GET /api/demo-config` (protected)
- `POST /api/call-demo` (protected)

## Retell Call Behavior

`POST /api/call-demo` accepts only:

- `firstName`
- `lastName`
- `phone`
- `amount`

Backend behavior:

- Uses `phone` as `to_number`
- Uses `RETELL_FROM_NUMBER` as `from_number`
- Uses `RETELL_AGENT_ID` as `override_agent_id`
- Builds dynamic variables:
  - `rl_clientName <- firstName`
  - `rl_clientSurname <- lastName`
  - `rl_debtAmount <- amount`
  - `int_companyName <- DEFAULT_COMPANY_NAME`
  - `rl_dueDate <- DEFAULT_DUE_DATE`
  - `rl_today <- generated YYYY-MM-DD`

## Render Deployment Notes (Free Tier)

This repository is now ready for Render with a blueprint file:

- `render.yaml`

### Option A: Blueprint deploy (recommended)

1. Push this repository to GitHub.
2. In Render, choose New + > Blueprint and select this repository.
3. Render will detect `render.yaml` and create one Web Service with the correct commands.
4. Fill all env vars marked as secret (`sync: false`) before first deploy.

### Option B: Manual Web Service setup

1. Create a new Web Service from this repository.
2. Configure:

- Environment: `Node`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`

3. Add environment variables from `.env.example`.
4. Add `NODE_ENV=production`.
5. Use a strong random value for `SESSION_SECRET`.

In production, Express serves `dist/` and keeps API routes under `/api/*`.
