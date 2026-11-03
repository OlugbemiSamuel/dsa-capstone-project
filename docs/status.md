# Project status

_This file is how a new AI session (or future me) recovers context. Update it at the end of every build._

## Where I am

- **Build:** 1 — Domain core in the terminal
- **Branch:** `build-1`
- **Done when:** `npm run demo` tells the whole story, `npm run benchmark` shows Map far faster than Array.find, first PR merged.

## Setup decisions already made

- My repo is `OlugbemiSamuel/dsa-capstone-project`. It started empty and contains **only** course docs, `.gitignore` and `README.md`.
- The tutor's reference implementation lives **outside** this repo at
  `C:\Users\user\Desktop\capstone-guide\das-2026-capstone-project`.
  It is read-only. I only open its `src/` for build-N **after** my own build-N PR is merged.
- I build `package.json`, `src/`, `scripts/` and `test/` myself.

## How I want AI to help me

- **Tutor mode** (default for rules, tests, debugging): ask me questions, give hints, do not dump code until I have attempted it.
- **Builder mode** (boilerplate I have done once already): draft from *my* spec; I review line by line.
- **Reviewer mode** (from Build 5): I write it, the AI criticises and quizzes me on boundary cases.

## Working agreements

1. Write my own spec before reading the tutor's AI prompt in `docs/build-N.md`.
2. Every AI prompt gets an entry in `docs/ai-log.md`.
3. Debug for 15 minutes alone before asking; bring a hypothesis.
4. Ownership gate before merge: I can explain every file, rewrite the hard function from memory, name a boundary case.
5. Never push to `main`; every build goes `build-N` -> PR -> merge.
6. **25-minute rule:** if a concept has not clicked, stop reading about it and do something with it (draw it, run it, break it). Re-reading is not the fix.
7. **Three passes per build,** because once is never enough:
   - *Pass A (understand):* read the milestone, write my spec, explain it back. No code.
   - *Pass B (build):* AI drafts from my spec; I review line by line and hand-write the core functions.
   - *Pass C (retrieve):* 2-3 days later, on a throwaway branch, rebuild one core file from memory, then diff it against my own work and delete the branch.
8. Recall drills: day 1 (5 min, answer written questions), day 3 (20 min, rebuild from memory), day 7 (5 min, explain it in the PR/demo).

## Memory files

- `docs/ai-log.md` — graded: what I asked, what came back, what was wrong.
- `docs/decisions.md` — my design decisions and why; defence notes.
- `docs/status.md` — this file.

## Next actions

- [ ] Orientation: explain Build 1 rules back to the tutor
- [ ] Write my own Build 1 spec (before reading the tutor prompt)
- [ ] Build the domain core
- [ ] Run demo + benchmark, explain the Big O result
- [ ] Commit, PR `build-1` -> `main`, merge
- [ ] Retro: compare my code with the tutor's Build 1

## Session log

| Date | What happened |
|---|---|
| 2026-10-22 | Repo cloned and wired to origin; docs copied; `build-1` branch created. Orientation started. |
