# MindMate

A mental wellness app built on the **MERN** stack.

| Layer | Tech | Folder |
|---|---|---|
| **M**ongoDB | Mongoose models, aggregation for trends | `backend/src/models` |
| **E**xpress | REST API, JWT cookie auth, validation, rate limiting | `backend/src` |
| **R**eact | Vite + React Router single-page app | `frontend/src` |
| **N**ode.js | Runtime for the API (Node 20+) | `backend` |

## Structure

```
MERN_miniproject/
├── frontend/   React app (pages, components, API client)
├── backend/    Express API + MongoDB models + tests
└── package.json  npm workspaces: one install, one `npm run dev`
```

## Run it

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

With no configuration the backend starts an embedded MongoDB (data kept in `backend/.data`).
To use your own MongoDB (Atlas or local), copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.
To get real AI chat replies, set `ANTHROPIC_API_KEY` there too; without it the chat uses built-in supportive replies.

| Command | What it does |
|---|---|
| `npm run dev` | Backend and frontend together |
| `npm test` | Backend API tests (real in-memory MongoDB) |
| `npm run build` | Production build of the frontend |
| `npm run seed` | Adds the sample clinicians (also runs on every backend start) |

## API overview

All routes are under `/api` and, except sign up and log in, require the login cookie.

| Area | Routes |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Account | `PATCH /me`, `GET /me/export`, `DELETE /me` |
| Mood | `GET /moods`, `PUT /moods/:date` |
| Journal | `GET/POST /journal`, `PUT/DELETE /journal/:id` |
| Screenings | `GET /screenings`, `POST /screenings` (PHQ-9 / GAD-7, scored on the server) |
| Trends | `GET /trends?range=week\|month\|year&today=YYYY-MM-DD` |
| Chat | `GET /chat`, `POST /chat` |
| Booking | `GET /clinicians`, `GET /clinicians/:id/slots`, `GET/POST /bookings`, `DELETE /bookings/:id` |
| Coping | `GET /coping/exercises` (steps and timed phases for the guided sessions) |
| Support | `GET /support/guidance?today=YYYY-MM-DD` (personalised from moods, screenings and chat), `GET /support/helplines` |

## How "feeling low" support works

Support is computed from what the person actually logs, not fixed text:

| Level | Triggered by (defaults, set in `backend/.env`) | What is shown |
|---|---|---|
| 1 | 3+ low or rough days in a row | Gentle ideas, places to go (map links), advice |
| 2 | 5+ days in a row, PHQ-9 of 10+, or GAD-7 of 10+ | Also websites to find professionals (no phone numbers) |
| 3 | 10+ days in a row, PHQ-9 of 20+, a self-harm answer, or a crisis message in chat | Also India helplines and 112 |

A run of low days that has already ended still counts for `GUIDANCE_PAST_RUN_LOOKBACK_DAYS` days (default 30), until a good or great day is logged. An ended run raises support to level 2 at most. Helplines (level 3) are for a streak that is still going, or for the screening and chat triggers above. After a mood or journal entry is saved, a pop-up shows the support once per level per day.

All suggestions, websites and helplines live in `backend/src/data/supportResources.js` and are loaded into MongoDB on start.
Helplines are India-only and were checked against each service's own site on 2026-11-01. Numbers change, so re-verify before going live.

## Notes

- This is a demo. The in-app text about encryption and HIPAA describes goals, not a certification.
- The chat detects messages about self-harm and answers with crisis helpline information instead of using the AI.
