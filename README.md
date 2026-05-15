<div align="center">
  <img src="client/public/logo.svg" alt="Ember" height="52" />
  <br/><br/>
  <p><em>An ember is what remains after the flame — small, quiet, and still warm.<br/>
  The words that move us are the same. Ember keeps them glowing.</em></p>
</div>

---

We all encounter words that stop us in our tracks — a line from a podcast, a quote from a book,
a thought that hits different at 2am. Ember is a personal space to collect those moments and
revisit them daily, so nothing resonant is ever lost.

## Features

### Daily Quote
Each day, one quote from your collection is surfaced as your daily inspiration — chosen at random
from everything you've saved. The selection is stable for the day (cached locally), so you can
return to it without it changing. If your collection is empty, the app nudges you to add your
first quote.

### Reflections
On the daily quote, you can write a personal reflection — a note to your future self about why
the words matter to you. Reflections are saved per quote and shown inline beneath the card when
you revisit.

### Collection
Your full library of saved quotes in one place. Quotes can be browsed in a **grid** or **list**
view, filtered by tag, and sorted by date added. A live search filters by quote text or author
as you type.

### Saving Quotes
Each quote stores:
- **Text** — the quote itself
- **Source** — the author or speaker
- **Work** — the book, film, album, or other source it came from (optional)
- **Tag** — a single semantic tag (e.g. wisdom, joy, grief) for organisation
- **Reflection** — a personal note (optional)

### Pinning
Any quote can be pinned to keep it at the top of your collection. Pinned quotes are visually
distinguished and always listed first.

### Tags
Quotes are organised with colour-coded tags. The collection can be filtered to show only quotes
with a specific tag. Tags also appear on the daily quote card and as coloured accents in the
sidebar's recent-quotes list.

### Share as Image
Any quote can be exported as a polished image card, ready to post or send. The share modal
offers full creative control:

- **Formats** — Story (9:16), Square (1:1), Landscape (16:9)
- **Templates** — Classic (italic with drop-quote), Bold (heavy weight), Minimal (centred),
  Marginalia (editorial with quote number)
- **Colour palettes** — 20+ options across solids (cream, night, ember, ink, paper, olive,
  bone, clay, plum, sky, moss, oxblood), gradients (dawn, dusk, aurora), and patterned designs
  (ledger lines, dot grid, crosshatch, arch, meridian)
- **Attribution toggle** — show or hide the author and work on the card
- **Export** — downloads as a full-resolution PNG, or opens the native OS share sheet on iOS,
  Android, and macOS

### Streak Tracking
A daily visit streak counts how many consecutive days you've opened the app. A week-view bar
shows your activity across the past seven days, rendered as a small bar chart next to the flame
icon.

### Themes
Three app-wide visual themes — **Warm** (parchment, the default), **Night** (dark), and
**Paper** (cool off-white) — switchable from the settings panel. Theme preference is saved to
your account and synced across devices.

### Internationalisation
The full app UI is available in **English** and **Korean**, switchable from the login screen or
settings. Korean uses a separate font stack and adjusted typographic styling throughout.

### Authentication
Sign in with Google. All quotes are private to your account. No passwords, no email
verification — just one click.

## Architecture

Ember is a monorepo with two independent Node projects: `server/` (API) and `client/` (frontend).

```
Browser → React (Vite) → Express API → Prisma → SQLite
```

Authentication is Google OAuth 2.0 via Passport.js. Sessions are persisted in a separate SQLite
database using `connect-sqlite3`. Theme and visit data are stored per-user in the main database.
In production the Express server doubles as a static file host, serving the built React app from
`client/dist/` and handling all routing via a catch-all route. The app runs self-hosted on a
Raspberry Pi.

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

## Coming Soon

- **AI-powered insights** — Your saved quotes say a lot about who you are and what you value.
  A future version will use your collection to surface patterns, build a personal profile, and
  offer uplifting, tailored suggestions.
- **Android app** — A native mobile experience for your collection.
