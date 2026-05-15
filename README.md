# Ember

> *An ember is what remains after the flame — small, quiet, and still warm.
> The words that move us are the same. Ember keeps them glowing.*

We all encounter words that stop us in our tracks — a line from a podcast, a quote from a book,
a thought that hits different at 2am. Ember is a personal space to collect those moments and
revisit them daily, so nothing resonant is ever lost.

## What it does

**Collect** — Save any quote that resonates with you. Add the source, the work it came from,
and an optional personal reflection. Tag quotes to organise by theme or mood.

**Browse** — Your entire collection in one place, searchable by keyword. Pin the quotes that
matter most.

**Get inspired daily** — Every day, one quote from your own collection is surfaced as your daily
inspiration. Words you chose, speaking to you at the right moment. A streak tracks how many days
in a row you've shown up.

**Share** — Export any quote as a polished image card. Choose from multiple aspect ratios
(story, square, landscape), templates (classic, bold, minimal, marginalia), and colour palettes.
The image downloads or shares natively via the system share sheet on iOS, Android, and macOS.

**Make it yours** — Switch between visual themes. The app is fully translated into English and
Korean.

**Your collection, your account** — Sign in with Google and your quotes are private to you.

## Coming soon

- **AI-powered insights** — Your saved quotes say a lot about who you are and what you value.
  A future version will use your collection to build a personal profile and offer uplifting,
  tailored suggestions for your life.
- **Android app** — A native mobile experience for your collection.

## Architecture

Ember is a monorepo with two independent Node projects: `server/` (API) and `client/` (frontend).

```
Browser → React (Vite) → Express API → Prisma → SQLite
```

Authentication is Google OAuth 2.0 via Passport.js. Sessions are stored in a separate SQLite
database using `connect-sqlite3`. In production the Express server doubles as a static file host,
serving the built React app from `client/dist/` and handling all routing via a catch-all route.

The app runs self-hosted on a Raspberry Pi.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| ORM | Prisma 7 (better-sqlite3 adapter) |
| Database | SQLite |
| Authentication | Google OAuth 2.0, Passport.js |
| Image export | html-to-image |
| i18n | react-i18next |
