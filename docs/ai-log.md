# AI log

Every time you give an AI tool a significant prompt, add an entry. Three lines each.
"Nothing was wrong" is allowed, but it is rarely true. Your instructor will read this.

## Build 1

### Prompt 1: Building the Build 1 domain core step-by-step

- **What I asked:** Help me learn to build the domain core for Build 1 based on docs/build-1.md, including custom errors, secure IDs, a linked-list queue, and an inventory store using Maps, written with arrow functions.
- **What came back:** Provided code files for errors.js, ids.js, waitlistQueue.js, inventory.js, and the demo/benchmark scripts.
- **What was wrong (or "nothing"):** A few adjustments were needed:
  1. Hit an initial ES module missing file error (`errors.js`) during the demo run, which was resolved by verifying file structure.
  2. Adjusted event status from a boolean (`published: false`) to a string (`status: 'draft'`) to match tutor specifications.
  3. Deeply reviewed and analyzed the modulo math logic (`bytes[i] % chars.length`) in `ids.js` and how the manual `store` object injection works across all inventory functions to ensure I fully owned the logic instead of treating it like a black box.

## Build 2

### Prompt 1: Build 2 prompt (docs/build-2.md)

- **What I asked:** We are building Build 2 of the Event Ticketing capstone, in plain JavaScript
  (ES modules, Node 22.13 or newer, no outside packages). Read README.md,
  docs/user-stories.md, docs/build-2.md and everything in src/domain/ before you write
  anything.

CRITICAL INSTRUCTION FOR THIS STEP: Do not write all files at once. We are going
file-by-file so I can learn deeply as i am junior. For this first step, write ONLY src/domain/sorting.js. use arrow functions always.

Implement:

1. src/domain/sorting.js: export function mergeSort(items, compare).
   - Write the merge sort yourself from scratch. Do NOT call Array.prototype.sort.
   - It must be stable (equal items keep their original order).
   - It must return a NEW array, and it must never modify the input array.

When you provide the code, break down every single line and explain how the
recursion, array splitting, and stable merging work behind the hood in plain English.

- **What came back:** Provided a recursive merge sort implementation utilizing a helper `merge` function that handles stability by prioritizing the left array on equal comparisons.
- **What was wrong (or "nothing"):** Nothing was wrong with the logic; verified that `.slice()` is used everywhere to guarantee the original input array is never mutated and that a brand-new array is returned.

### Prompt 2:

- **What I asked:**We are continuing Build 2 of the Event Ticketing capstone.

For this second step, write ONLY the updates for src/domain/inventory.js:

1. publishEvent(store, eventId)
   - Publishing an event with no ticket tiers must throw an INVALID_STATE error (using our custom DomainError from error.js).
   - Updates the event status to published.
2. listEventSummaries(store, { publishedOnly = true })
   - Returns summaries of events.
   - When publishedOnly is true (default), draft events are hidden from the public list.
   - Must return a new array / mapped summaries so the original store state is never mutated.

Explain the implementation clearly line by line in plain English. Do not write the search or test files yet.

- **What came back:** Provided the two functions leveraging `Array.from()`, `.some()`, `.filter()`, and `.map()` to generate safe event summaries and enforce publishing validation rules.
- **What was wrong (or "nothing"):** Nothing was wrong; verified with a test script that draft filtering, tier checks, and error handling (`NOT_FOUND`, `INVALID_STATE`) behave correctly without mutating the store.

### Prompt 3:

- **What I asked:**We are continuing Build 2 of the Event Ticketing capstone.

For this third step, write ONLY src/domain/eventSearch.js:

- Pure functions only (events in, new list out). Import mergeSort from ./sorting.js and DomainError from ./error.js.
- filterEvents(summaries, { q, city, from, to, maxPriceCents, onlyAvailable })
  - q matches title or venue, ignoring case.
  - city matches exactly, ignoring case.
  - from and to are inclusive, and a date-only 'to' includes that whole day.
  - maxPriceCents compares with the cheapest tier. Events with no tiers are left out of price filters.
  - A bad date or a price that is not a whole number is a VALIDATION error.
- sortEvents(summaries, sortBy)
  - sortBy is 'date' (earliest first), 'price' (cheapest first, no price last) or 'availability' (most seats left first).
  - Always break ties by title (alphabetical), then id. Use your mergeSort.
  - An unknown sortBy is a VALIDATION error.
- searchEvents(summaries, criteria, sortBy) = filter, then sort.
- Ensure the original input summaries array is never mutated.

Explain the implementation clearly line by line in plain English. Do not write the test files yet.

- **What came back:** Implemented `filterEvents`, `sortEvents`, and `searchEvents` along with helper functions for date parsing and comparison logic (`date`, `price`, `availability`) with tie-breaking by title and id.

- **What was wrong (or "nothing"):** Nothing was wrong with the test output; I asked to clarify how comparator return values (`-1` vs `1`) control ascending vs. descending placement so I clearly understand the ordering logic.

### Prompt 4:

- **What I asked:**We are finishing Build 2 of the Event Ticketing capstone.

For this final step, write ONLY the automated test files in test/ (using node:test and node:assert/strict) and update package.json to add the "npm test" script.

Make sure the tests cover:

- Every acceptance criterion for S02, S03, S05, and S06 in docs/build-2.md.
- Every S04 publishing criterion written in docs/build-2.md (such as publishing a draft event with tiers, and rejecting publishing an event with no tiers with INVALID_STATE).
- The original list is unchanged after filtering and sorting.
- The sort is stable (equal items preserve original relative order).
- Empty lists are handled cleanly.
- Every error code (such as VALIDATION, NOT_FOUND, INVALID_STATE, SOLD_OUT) is tested.

Explain the test structure and how node:test runs them clearly in plain English. Do not modify any files in src/domain/.

- **What came back:** Created `test/sorting-test.js`, `test/inventory-test.js`, and `test/eventSearch-test.js`, updated `package.json` with `"npm test"`, and verified all 47 tests pass.

- **What was wrong (or "nothing"):** The agent noted two existing `src/domain/` validation gaps relative to the acceptance criteria—invalid date string checks in `createEvent` (S02) and whole-number checks on `priceCents` in `addTier` (S03)—which remain uncovered until `src/domain/` is updated.Which I have also fixed and all my test still passes.
