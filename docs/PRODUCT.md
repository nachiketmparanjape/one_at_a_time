# One at a Time — product doc

> **Purpose:** ORIENT — a human or AI picking One at a Time up cold reads
> this to know what the app does now, why, and where things live.
> **Earns its place if:** a cold reader can start work from it
> without reading the code first.
> **Owner:** Bramble (PM). **Status:** living.
> **Last verified:** 2026-10-24, against the repo and the live app
> (Doc Sprint 1).

Living reference for humans and AIs picking up this project: what the product
does, grouped by capability, and *why* each exists. Deliberately not verbose.

## Maintaining this doc (read before editing)
- **Revise, don't append.** When a capability changes, rewrite its bullet in
  place. This doc always describes the product *as it is now* — never as a
  history of how it got here.
- **Capabilities, not paper cuts.** Group by what the user can do, not by
  sprint or PR. A paper cut that extends an existing capability edits that
  capability's bullet; only a genuinely new capability earns a new section.
- **Every bullet earns its place with a why.** One line. If you can't say
  why, it doesn't belong here yet.
- **History lives elsewhere.** Per-update detail goes in `SHIPPED.md` and
  sprint plans — never duplicated here.
- **Research ends in a decision, kept compact.** Open topics get findings;
  findings get a decision, even "don't build it." Decided topics stay as a
  short record — question, key findings, decision — so the reasoning remains
  visible.

Not a changelog — per-update history lives in `SHIPPED.md` and the sprint
plans under `sprints/`. If something here disagrees with those, this doc wins
and the history is just history.

## What it is

An anti-overwhelm task app: instead of a guilt-inducing list, you see **one
task at a time** — swipe to accept it or dismiss it to the next. A smart
picker decides which task surfaces, weighing urgency, due dates, and how
actionable the task sounds. The to-do list is the core loop — open, get your
one thing, do it. Full scope and non-goals: `VISION.md`.

## Tech

React + Vite SPA on Vercel; Firebase Auth (Google + anonymous, with account
linking/switching), Firestore; Tailwind CSS. Mobile-first PWA: service
worker, web manifest, haptics, swipe gestures, safe-area support.

## Capabilities

### The one-thing view (the core loop)
- **Single-task focus screen with swipe gestures.** Why: a full task list
  triggers avoidance in scattered brains; one task is a decision, not a
  landscape.
- **Smart task picker** (`src/utils/taskSelector.js`). Why: "random" would
  surface trivia; pure priority order would feel like a boss. The scorer
  blends both:
  - urgent flag always wins; due-date urgency (overdue → due this week)
  - actionability scoring — starts-with-a-verb bonus, short-task bonus,
    vague-language penalty ("maybe", "look into", "someday")
  - dismiss penalty (keeps resurfacing what you skip, but less), staleness
    boost (long-unseen tasks bubble back up)
  - weighted-random pick among the scored — likely, not guaranteed

### Task management
- **Add tasks via FAB modal** (text, due date, urgent flag). Why: capture has
  to be under 10 seconds or tasks live in your head instead.
- **All-tasks list + archive (done) + stats screens.** Why: the focus view
  is for doing; the list is for reviewing, the archive for proof, stats for
  the scoreboard.

### Auth
- **Google + anonymous sign-in, anonymous→Google linking, account
  switching.** Why: zero-friction start; the linking flow means early
  anonymous tasks survive the upgrade to a real account.

## Open research topics

- **AI task breakdown** — the picker already detects vague tasks (penalty);
  the natural next step is offering to split them into concrete subtasks via
  an LLM when vagueness is detected. Cost/latency model TBD. (Seeded
  2026-10-09.)

## Key files

- `src/utils/taskSelector.js` — the scoring + weighted-pick engine
- `src/components/SingleTaskView.jsx` — the one-thing screen
- `src/components/Stats.jsx`, `AllTasks.jsx`, `Archive.jsx` — the other tabs
- `src/utils/firebase.js` — auth + Firestore helpers
- `src/hooks/useTasks.js` — task data hook

## Source of truth

- GitHub: https://github.com/nachiketmparanjape/one_at_a_time
- Local: `~/workspace/vercel-recovery/one_at_a_time`
- Docs: this product's documents live in the repo under `docs/`;
  the studio folder `~/workspace/studio/products/one_at_a_time` is a
  symlink to it.
- Deployed: https://oneatatime-seven.vercel.app (canonical; title-verified by fetch 2026-10-24)
