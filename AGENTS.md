# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project

**Ember** — a personal quotes collection app. Users sign in with Google, save quotes they find meaningful, and get one random quote surfaced as their daily inspiration.

Shipped features: tags, sharing (image export), streak tracking, theme preference, i18n (English / Korean).

Planned future features: AI-powered insights from the collection, Android app.

## Commands

### Backend (run from `server/`)
```bash
npm run dev       # start with hot reload (node --watch)
npm start         # start without hot reload (production)
```

### Frontend (run from `client/`)
```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # build to client/dist/ (required before testing production serving)
npm run lint      # ESLint
```

### Database (run from `server/`)
```bash
npx prisma migrate dev        # apply schema changes in development
npx prisma generate           # ALWAYS run after migrate dev — Prisma 7 no longer auto-generates
npx prisma migrate deploy     # apply migrations in production (Pi)
npx prisma generate           # also required after migrate deploy and after npm install
```

## Architecture

This is a **monorepo** with two independent Node projects: `server/` and `client/`. They have separate `package.json` files and must be installed independently.

### Request flow

```
Browser → React (client/) → Express API (server/) → Prisma → SQLite (server/prisma/dev.db)
```

In **development**, the frontend runs on port 5173 (Vite) and makes API calls to `http://localhost:3000` via `VITE_API_URL`. CORS is enabled with `credentials: true`.

In **production**, Express serves the built React files from `client/dist/` as static assets. The catch-all route (`/{*path}`) hands all unmatched URLs to React Router. In this mode `VITE_API_URL` is empty, so all API calls use relative URLs.

### Authentication flow

Google OAuth 2.0 via Passport.js. The full flow:

1. Frontend redirects browser to `GET /auth/google`
2. Google redirects to `GET /auth/google/callback`
3. Passport's `GoogleStrategy` upserts the user in the DB
4. `serializeUser` stores only `user.id` in the session (SQLite-backed via `connect-sqlite3`)
5. On every subsequent request, `deserializeUser` fetches the full user from the DB and populates `req.user`
6. `GET /auth/me` is called on app load by the React frontend to rehydrate auth state

The middleware order in `server/index.js` is load-order sensitive: `express-session` → `passport.initialize()` → `passport.session()` → routes.

### Auth guard

`server/middleware/isAuthenticated.js` — applied via `router.use(isAuthenticated)` at the top of `server/routes/quotes.js`, so all quote endpoints require login without repeating the check per route.

### Frontend auth

`App.jsx` calls `/auth/me` on mount and holds `user` state at the top level. `ProtectedRoute` redirects to `/` if `user` is null. `Layout` hides the `NavBar` on the `/` (login) route.

### Key env vars

`server/.env`:
- `CLIENT_URL` — used as the CORS origin and for OAuth redirect URLs. Set to `http://localhost:5173` in dev, the real domain in production.
- `DATABASE_URL` — SQLite file path, e.g. `file:./prisma/dev.db`
- `SESSION_SECRET` — must be a long random string

`client/.env`:
- `VITE_API_URL` — set to `http://localhost:3000` in dev, empty string in production

### Prisma

Prisma 7 requires a driver adapter — `PrismaBetterSqlite3` from `@prisma/adapter-better-sqlite3`. The adapter is instantiated directly (not via a URL string) in `server/config/passport.js`, `server/routes/quotes.js`, and `server/routes/settings.js`. After `npm install` on a new machine, run `npx prisma generate` to rebuild the client.

Two SQLite databases:
- `server/prisma/dev.db` — app data (Users, Quotes, UserSettings, Visits)
- `server/prisma/sessions.db` — session store (managed by `connect-sqlite3`)

Data models:
- `User` — Google OAuth user (googleId, email, displayName)
- `Quote` — saved quote (text, source, work, tag, reflection, pinned, createdAt)
- `UserSettings` — one-to-one with User; stores `theme` (default `"warm"`)
- `Visit` — one-to-many with User; stores `date` (YYYY-MM-DD), unique per `[userId, date]`; used to compute streaks

### Settings route

`server/routes/settings.js` — requires auth, mounted at `/api/settings`:
- `GET /api/settings` — returns theme; upserts `UserSettings` on first access
- `PATCH /api/settings` — updates theme
- `POST /api/settings/visits` — idempotent visit record; returns `{ streak, weekDays }`

Frontend hooks: `useTheme(user)` and `useStreak(user)` in `client/src/hooks/`.

### Daily quote

`DashboardPage` fetches `/api/quotes/daily` once per day and caches the result in `localStorage` keyed by today's date string (`"YYYY-MM-DD"`). On the backend, a random quote is selected using Prisma's `skip/take` pattern against a total `count`.

## Deployment (Raspberry Pi)

The app runs on a Pi at `192.168.45.200`. Steps after pushing changes:

```bash
# Copy built frontend to Pi
scp -r client/dist pi:~/repos/ember/client/dist

# Or copy server changes
scp server/routes/quotes.js pi:~/repos/ember/server/routes/quotes.js
```

On the Pi, restart the server and run migrations if the schema changed:
```bash
npx prisma migrate deploy   # only if schema changed
npx prisma generate         # required after migrate deploy (Prisma 7 no longer auto-generates)
npm start &                 # start in background
```

**Google OAuth constraint**: Google blocks raw IP addresses as redirect URIs. During development on Mac, use an SSH tunnel: `ssh -L 3000:localhost:3000 pi`, then access via `http://localhost:3000`. A proper domain + Cloudflare Tunnel is needed for phone access via WireGuard VPN (planned).


## Additional Commands
Do not make any changes until you have 95% confidence in what you need to build. Ask me follow-up questions until you reach that confidence.