# Review round 1: `truncate(s, n)`

Stage: review (Reviewer). Date: 2026-10-06. Range: `cd2c324..90ce444`.

## Verdict

**Changes requested.** Code matches the task byte for byte, but the task's
formula does not truncate and the suite is red.

`npm test` (`node --test`): 3 tests, 1 pass, 2 fail.

```
✖ truncate keeps n characters, then an ellipsis   'ab…' !== 'abc…'   test/text.test.js:7
✖ truncate leaves a short string alone            'ab…' !== 'ab'     test/text.test.js:10
```

## Strengths

- `src/text.js:5-7` is exactly the product-decided one-liner. No scope creep:
  diff touches `src/text.js` (+4) and two docs only.
- Implementer did not run the suite (as told) and said so plainly.
- Design doc behavior table (`2026-10-06-truncate-design.md:42-50`) re-verified
  with `node -e`: all seven rows correct. Conflict with seeded tests flagged in
  both docs before review found it.

## Findings

### Critical

**1. Formula is not truncation. Two pre-existing tests fail.**
- Location: `src/text.js:6`.
- Failure: `truncate('abcdef', 3)` → `'ab…'` (expected `'abc…'`).
  `truncate('ab', 3)` → `'ab…'` (expected `'ab'`). Also `truncate('abcdef', 100)`
  → `'abcdef…'` (nothing cut, ellipsis added), `truncate('', 3)` → `'…'`,
  `truncate('abc', 3)` → `'ab…'` (exact fit mangled).
- Why: `n - 1` keeps one fewer char than asked, and the ellipsis is appended
  even when nothing was removed. A function named `truncate` that lengthens
  strings that already fit breaks every caller's expectation. Suite cannot
  go green on `main`.
- Fault: the product decision in the task, not the engineer. Tests pre-date
  this work (seed `cd2c324`) and encode the normal meaning.
- Fix (one line, passes both seeded tests, verified):
  ```js
  export function truncate(s, n) {
    return s.length <= n ? s : s.slice(0, n) + '…';
  }
  ```
  Outputs: `('abcdef',3)→'abc…'`, `('ab',3)→'ab'`, `('abc',3)→'abc'`,
  `('abcdef',100)→'abcdef'`, `('',3)→''`, `('abcdef',0)→'…'`.
  Alternative if product insists on `n - 1` with no branch: rewrite the two
  seeded tests to the design-doc table and document that `n` is total output
  length including the ellipsis. Either way is a task-owner decision.

### Important

**2. `n <= 0` slices from the end and returns most of the string.**
- Location: `src/text.js:6`.
- Failure: `truncate('abcdef', 0)` → `'abcde…'`; `truncate('abcdef', -1)` →
  `'abcd…'`; `truncate('abcdef', -2)` → `'abc…'`. Smaller `n` gives more output.
- Why: `slice(0, -1)` counts from the end. Any computed width that hits 0
  renders nearly the whole string.
- Fix: covered by the fix in #1 (`slice(0, 0)` → `''`, result `'…'`). No
  separate change if #1 is taken.

### Minor

**3. Non-numeric `n` collapses silently.**
- `truncate('abcdef', NaN)` → `'…'`, `truncate('abcdef', undefined)` → `'…'`,
  `truncate('abcdef', 2.7)` → `'a…'`, `truncate('abcdef', '3')` → `'ab…'`.
- Out of scope per design doc. No fix recommended without a real caller.

**4. Code-unit slicing splits surrogate pairs.**
- `truncate('😀😀😀', 2)` → `'\ud83d…'` (lone high surrogate).
- Out of scope per design doc. If user text with emoji is a real input,
  `[...s].slice(0, n).join('')` or `Intl.Segmenter`.

**5. Non-string `s` throws `TypeError`.**
- `truncate(null, 3)`, `truncate(42, 3)` throw. Same contract as `slugify`.
  Consistent, out of scope.

## Callers checked

No callers of `truncate` outside `test/text.test.js`. No other code affected.

## Open question for PR reviewer

Pick one before merge: (a) switch to the ternary in finding #1 and keep the
seeded tests, or (b) keep the product formula and rewrite both seeded tests.
Reviewer recommends (a): one line, green suite, matches function name, fixes
#2 for free.
