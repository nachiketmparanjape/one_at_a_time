# One at a Time — the next-right-thing picker

**Live app: https://oneatatime-seven.vercel.app**

## The idea

End task-list paralysis.

A long to-do list is a wall you stare at; One at a Time never shows you the
wall. You open the app and it hands you exactly one task — the next right
thing — chosen from your list by a scoring picker that weighs urgency, due
dates, and how actionable a task actually is. Do it, or swipe it away and
get the next one. The list manages itself in the background.

## What the current version does

- **One-task focus view** — a single task on screen, with swipe to accept
  or dismiss to the next pick
- **Smart picker** — scores tasks on urgency, due dates, and actionability
  (including a penalty for vague tasks), then picks with weighted randomness
  so it isn't the same order every time
- **Quick task capture** — add tasks with a due date and an urgent flag
- **All-tasks list and archive** — the full list is there when you want it;
  done and dismissed tasks move out of the way
- **Stats** — see what you've actually been getting through
- **Sign-in** with Google, or continue anonymously and link the account
  later
- **Installable PWA** — mobile-first, works offline, home-screen ready

## Tech stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Auth & database:** Firebase Authentication (Google + anonymous) and
  Cloud Firestore
- **PWA:** vite-plugin-pwa (offline shell, install prompt)

## Run it locally

```bash
npm install
npm run dev   # Vite dev server
```

Firebase config lives in the app's Firebase client setup — point it at your
own Firebase project (Authentication + Firestore) to run your own instance.

## Deployment

Hosted on Vercel from this repo's `main` branch.

## Documentation

The product's working documents live in [`docs/`](docs/):

- [`docs/VISION.md`](docs/VISION.md) — purpose, scope, non-goals
- [`docs/PRODUCT.md`](docs/PRODUCT.md) — what the current version does, and why
- [`docs/BACKLOG.md`](docs/BACKLOG.md) — waiting work
- [`docs/SHIPPED.md`](docs/SHIPPED.md) — per-update history
- [`CLAUDE.md`](CLAUDE.md) — agent context: run/deploy, gotchas

---

Part of a one-person studio building focus tools for scattered brains —
small apps, each built around one daily loop.
