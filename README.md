# Ember

> *An ember is what remains after the flame — small, quiet, and still warm.
> The words that move us are the same. Ember keeps them glowing.*

We all encounter words that stop us in our tracks — a line from a podcast, a quote from a book,
a thought that hits different at 2am. Ember is a personal space to collect those moments and
revisit them daily, so nothing resonant is ever lost.

## What it does

**Collect** — Save any quote that resonates with you. Add the source so you remember where it
came from, or just save the words themselves.

**Browse** — Your entire collection in one place, always accessible. Search by keyword to find
that one quote you half-remember.

**Get inspired daily** — Every day, one quote from your own collection is surfaced as your daily
inspiration. Words you chose, speaking to you at the right moment.

**Your collection, your account** — Sign in with Google and your quotes are private to you.
Build a collection that's entirely personal.

## Coming soon

- **AI-powered insights** — Your saved quotes say a lot about who you are and what you value.
  A future version will use your collection to build a personal profile and offer uplifting,
  tailored suggestions for your life.
- **Android app** — Take your collection with you on mobile.
- **Categories & tags** — Organise your quotes by theme, mood, or topic.
- **Share** — Share a quote with someone who needs to hear it.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | SQLite (via Prisma ORM) |
| Authentication | Google OAuth 2.0 (Passport.js) |

## Getting Started

### Prerequisites

- Node.js v18+ (recommend installing via [nvm](https://github.com/nvm-sh/nvm))
- A Google Cloud project with OAuth 2.0 credentials

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd meaningful-quotes-app
   ```

2. Install dependencies
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Configure environment variables
   ```bash
   cd server
   cp .env.example .env
   # Fill in your Google OAuth credentials and session secret
   ```

4. Run database migrations
   ```bash
   cd server
   npx prisma migrate dev
   ```

### Running Locally

**Terminal 1 — Backend** (`http://localhost:3000`)
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend** (`http://localhost:5173`)
```bash
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

Create `server/.env` (use `server/.env.example` as a template):

```
PORT=3000
DATABASE_URL="file:./prisma/dev.db"
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=a_long_random_string
```
