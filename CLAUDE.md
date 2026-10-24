# One at a Time — agent context

> **Purpose:** OPERATE — an AI agent working in this repo reads this
> first: how to run, deploy, and not break the app. Product facts
> live in `docs/` and are linked, never copied here.
> **Last verified:** 2026-10-24 (Doc Sprint 1) — created in this
> sprint; the other studio products already had one.

## Read first

- What the app does and why: [`docs/PRODUCT.md`](docs/PRODUCT.md)
- Scope and non-goals: [`docs/VISION.md`](docs/VISION.md)
- Waiting work: [`docs/BACKLOG.md`](docs/BACKLOG.md)

## The app in two lines

An anti-overwhelm task app: one task on screen at a time, chosen by a
scoring picker (urgency, due dates, actionability, weighted random).
React + Vite SPA on Vercel; Firebase Auth (Google + anonymous, with
account linking) and Firestore; Tailwind CSS; mobile-first PWA.

## Run / deploy

```bash
npm install
npm run dev     # Vite dev server
npm run build   # production build (known: one ~631 KB chunk — PC-O4 tracks the split)
```

Deploys are hosted on Vercel from `main`; GitHub auto-deploy is not
yet connected (PC-O1 tracks it). Live (canonical):
https://oneatatime-seven.vercel.app

Firebase config lives in `src/utils/firebase.js` — point it at your
own Firebase project (Authentication + Firestore) to run an instance.

## Gotchas

- **The picker is heuristic on purpose** — no LLM. Its scoring rules
  (verb bonus, vagueness penalty, dismiss penalty, staleness boost)
  are the product's core; see `src/utils/taskSelector.js` and the
  capability notes in `docs/PRODUCT.md` before touching them.
- **Anonymous → Google linking must keep working** — early anonymous
  tasks surviving the upgrade is a designed promise, not an accident.
