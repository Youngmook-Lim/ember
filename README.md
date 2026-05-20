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
- **Tags** — one or more semantic tags (e.g. wisdom, joy, grief) for organisation
- **Reflection** — a personal note (optional)

### Pinning
Any quote can be pinned to keep it at the top of your collection. Pinned quotes are visually
distinguished and always listed first.

### Tags
Quotes are organised with colour-coded tags drawn from a curated palette (wisdom, love, courage,
grief, joy, hope, awe, solitude, change, and more). The collection can be filtered to show only
quotes carrying a specific tag, and tags appear as small chips on the daily card, in the sidebar's
recent list, and across the collection. Tag names are translated for both English and Korean.

### Discover — AI Quote Recommendations
Tell Ember what you're searching for — a feeling, a fragment, a thing you can't quite name — and
it brings back five quotes from a curated corpus of public-domain voices that lived near it.

- **Hearth search bar** — a single ember-lit prompt with rotating example threads ("the weight of
  unsaid words", "starting over after loss", "quiet joy in small things")
- **Letter from Ember** — each result set opens with a short personal note framing why these
  particular voices were chosen for your prompt
- **Personalised picks** — recommendations are informed by your recent and pinned quotes, so
  results lean toward the registers you already gravitate to
- **Save with one tap** — any pick saves directly to your collection, with Ember's blurb pre-filled
  as your reflection and the AI badge marking its origin
- **Bilingual** — Korean prompts are auto-translated for retrieval, and results are returned with
  Korean translations of the quote and author/work names
- **Graceful fallbacks** — clarification prompts for vague queries, a "quiet" state when the LLM
  is unavailable

Under the hood: query embedding via OpenRouter, top-K semantic search over a local sqlite-vec
index of the ingested corpus, and a final personalisation pass by a chat model that picks five,
writes the intro, and (for Korean) translates.

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
settings. Korean uses a separate font stack and adjusted typographic styling throughout, and the
Discover feature accepts Korean prompts and returns Korean translations of recommended quotes.

### Feedback
A persistent feedback button lets anyone signed in report a bug, suggest an improvement, or send
a note. Submissions capture the page and locale they came from, with an opt-in flag to allow a
reply.

### Admin Dashboard
Admin-flagged accounts get a private `/admin` page with two collapsible panels:

- **Stats** — totals and weekly deltas for users, quotes (user vs AI origin), reflections, pins,
  corpus size, top tags, and weekly active visitors
- **Feedback triage** — every submission in newest-first order, with status transitions
  (new → reviewed → done / dismissed) and delete

### Authentication
Sign in with Google. All quotes are private to your account. No passwords, no email
verification — just one click.

## Architecture

Ember is a monorepo with two independent Node projects: `server/` (API) and `client/` (frontend).

```
Browser → React (Vite) → Express API → Prisma → SQLite ( + sqlite-vec for Discover )
                                    ↘ OpenRouter (embeddings + chat) for Discover
```

Authentication is Google OAuth 2.0 via Passport.js. Sessions are persisted in a separate SQLite
database using `connect-sqlite3`. Theme, visits, and feedback are stored per-user in the main
database. The Discover corpus lives in its own `CorpusQuote` table, with embeddings stored in a
sqlite-vec virtual table loaded as a SQLite extension on every Prisma adapter. In production the
Express server doubles as a static file host, serving the built React app from `client/dist/` and
handling all routing via a catch-all route. The app runs self-hosted on a Raspberry Pi.

### Corpus Ingestion
The Discover corpus is built offline by ingest scripts (`npm run ingest:corpus` in `server/`),
which:

1. Pull quotes from multiple source feeds (Quotable, a HuggingFace dataset, and a curated seed
   list)
2. Normalise and dedupe by text
3. Resolve Korean labels for authors and works via Wikidata (with an LLM fallback)
4. Embed every quote in batches and write vectors into the sqlite-vec index

A separate `npm run ingest:backfill-ko` script can refill Korean labels later without re-embedding.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| ORM | Prisma 7 (better-sqlite3 adapter) |
| Database | SQLite |
| Vector search | sqlite-vec (SQLite extension) |
| AI | OpenRouter — `text-embedding-3-small` (embeddings), Claude Haiku 4.5 (chat) |
| Authentication | Google OAuth 2.0, Passport.js |
| Image export | html-to-image |
| i18n | react-i18next |
| Logging | Winston (daily rotated files) |

## Coming Soon

- **Deeper AI insights** — Beyond on-demand discovery, surface patterns across your saved quotes
  to build a personal profile and offer tailored suggestions.
- **Android app** — A native mobile experience for your collection.
