# One at a Time — backlog

> **Purpose:** TRACK — the waiting work for this product: every
> card here is real, unshipped, and pullable into a sprint.
> **Earns its place if:** sprint planning can pull from it without
> re-verifying that cards are still true.
> **Owner:** Bramble (PM). **Status:** living.
> **Last verified:** 2026-10-24 (Doc Sprint 1).

Paper-cut cards waiting for a sprint. PM-seeded from the 2026-10-09 studio
import (code study, not founder requests) — founder confirms priority at
planning.

_Closed cards leave this file — PC-O2 (README rewrite) shipped
2026-10-11; see `SHIPPED.md`. (Doc Sprint 1, 2026-10-24.)_

---

## PC-O1 — Connect GitHub repo for auto-deploys

**Problem:** Repo exists on GitHub (`nachiketmparanjape/one_at_a_time`,
pushed 2026-10-09 from the Vercel recovery) but Vercel isn't watching it —
deploys still depend on whoever ran the CLI last.

**In scope:** Vercel project → Settings → Git → connect the repo,
production branch `main`; one test push to verify auto-deploy.
**Out of scope:** any code changes; preview-deploy workflow.

**Done looks like:** a push to `main` triggers a Vercel production deploy
with no laptop involved.
**Size:** S.

---

## PC-O3 — Surface "why this task" on the focus view

**Problem:** The picker has thoughtful scoring, but the user just sees a
task — no hint why *this* one surfaced, which makes the choice feel random
and erodes trust in it.

**In scope:** one subtle line under the task ("Due tomorrow", "You've
skipped this 3× — still here", "Quick win"). Reuse the existing score
breakdown; no scoring changes.
**Out of scope:** letting users tweak weights; full score display.

**Done looks like:** every surfaced task carries a one-line reason that
matches the actual scoring.
**Size:** S–M.

---

## PC-O4 — Code-split the JS bundle

**Problem:** Production build emits a single 631 KB JS chunk (194 KB
gzipped); Vite warns it's over the 500 KB limit. Slower first load,
especially on mobile — this is a mobile-first PWA.

**In scope:** route-level `React.lazy` splits (focus / tasks / archive /
stats) or `manualChunks` for vendor code; verify the PWA precache still
works after the split.
**Out of scope:** rewriting components; SSR.

**Done looks like:** `vite build` shows no chunk over 500 KB and the app
loads identically.
**Size:** S.

*Seeded 2026-10-09 from the studio debug pass (clean build, chunk-size
warning only).*
