# Concept cards

One card per idea I have to own. Written **from memory first**, then corrected.
Reviewing a card I wrote beats re-reading an explanation I didn't.

## Template

### Concept name
- **Problem it solves:**
- **Mechanism (how it actually works):**
- **Cost / tradeoff:**
- **When it is the wrong choice:**
- **Where I used it:** build N, `path/to/file.js`
- **Recall:** date — from memory? yes / partly / no

---

## Worked example (format only — rewrite this in my own words)

### Derived state: `seatsLeft = capacity - sold`
- **Problem it solves:** two numbers that must agree will eventually disagree. A sold-out event that still shows seats is a bug you find at the door.
- **Mechanism:** only `sold` is stored. `seatsLeft` is a function of the data, computed on read, so it cannot drift.
- **Cost / tradeoff:** you pay a tiny computation on every read, and you cannot "fix" a display without fixing the data.
- **When it is the wrong choice:** when computing it is expensive (e.g. summing a million rows on every page load) — then you cache it, and you accept the job of invalidating the cache.
- **Where I used it:** build 1, `src/domain/inventory.js`
- **Recall:** 2026-10-22 — partly (I said "derivation maths", which is the right idea in the wrong words).

---

## Build 1 cards to write

- [ ] **Linked-list FIFO queue** — head, tail, why `shift()` is O(n) and `dequeue()` is O(1)
- [ ] **Hash map lookup** — why `Map.get` is O(1) and `Array.find` is O(n)
- [ ] **The capacity invariant** — `sold + n <= capacity`, and check-everything-then-change-everything
- [ ] **Money as integer cents** — why `0.1 + 0.2 !== 0.3`, and where formatting belongs
- [ ] **Typed domain errors** — why a `code` (`SOLD_OUT`) is separate from a `message`
