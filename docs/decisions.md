# Decision log

One short entry per decision that I might be asked to defend. Newest at the bottom.
Format: **What** I chose, **why**, **what I rejected**, **what I would revisit**.

## 2026-10-22 — Start my repo empty instead of cloning the tutor's repo

- **Chose:** an empty repo containing only course docs, `.gitignore` and `README.md`.
- **Why:** cloning the tutor's repo would import their finished `src/` and their git history, so I would start every build from the answer and never practise turning a milestone into code.
- **Rejected:** forking/cloning the tutor repo and deleting `src/` — the history and remote would still tie my submission to their solution.
- **Revisit:** if the tutor requires a fork for review, I can add their repo as a read-only second remote without merging it.
