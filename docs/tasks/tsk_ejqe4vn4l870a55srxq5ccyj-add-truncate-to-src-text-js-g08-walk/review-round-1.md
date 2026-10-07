# Review round 1: `truncate(s, n)` in `src/text.js`

Stage: review. Range `cd2c324..a24eed9`. Unattended. Read-only; no code changed.

## Test run

```
$ npm test
✔ slugify
✖ truncate keeps n characters, then an ellipsis   'ab…' !== 'abc…'   (test/text.test.js:7)
✖ truncate leaves a short string alone            'ab…' !== 'ab'     (test/text.test.js:10)
tests 3, pass 1, fail 2
```

## Strengths

- `src/text.js:5-7` matches the task byte-for-byte: one line, `s.slice(0, n - 1) + '…'`, no branches, same style as `slugify`.
- Scope held: only `src/text.js` touched in code; seeded tests untouched; no speculative guards.
- `brainstorm.md` and `implement.md` state the test/product conflict up front and their expected-vs-actual claims are correct (verified `truncate('abc', 0)` → `'ab…'`).
- Landing the export un-breaks `slugify`, which previously failed at import time.

## Findings

### Important

**1. Test suite red: mandated body contradicts committed test contract.**
- Location: `src/text.js:6` vs `test/text.test.js:7` and `test/text.test.js:10`.
- Failure: `truncate('abcdef', 3)` returns `'ab…'`, test expects `'abc…'`. `truncate('ab', 3)` returns `'ab…'`, test expects `'ab'`. Also `truncate('abc', 10)` → `'abc…'`: ellipsis appended to a string that was not truncated.
- Cause: the task fixes the body (`n - 1`, always append, no branches). The seeded tests encode a different contract (keep `n` chars, leave short strings alone). Both cannot hold. The implementation is faithful to the task; the defect is in the requirement, not the code.
- Fix (pick one, needs a human decision):
  - (a) Product confirms `n` = total output length including ellipsis, always appended → change the two assertions to `'ab…'` and `'ab…'` (or drop the short-string test).
  - (b) Product confirms the test contract → body becomes `return s.length > n ? s.slice(0, n) + '…' : s;`. Still one line, but violates "no other branches", so the task text must be amended.
- Severity rationale: not Critical (no data loss, no production callers; only `test/text.test.js` references `truncate`), but the branch cannot merge with a red suite.

### Minor

**2. Degenerate `n` values slice from the end or return only the ellipsis.**
- Location: `src/text.js:6`.
- Failure: `('abc', 0)` → `'ab…'`, `('abc', -1)` → `'a…'`, `('abc', 1)` → `'…'`, `('abc', undefined)` → `'…'`, `('abc', NaN)` → `'…'`.
- Fix: none required under "no other branches". If a guard is ever permitted: `Math.max(0, n - 1)`. Otherwise document that callers must pass `n >= 2`.

**3. Splits surrogate pairs.**
- Location: `src/text.js:6`.
- Failure: `('😀😀😀', 2)` → `'\ud83d…'` (lone high surrogate).
- Fix: none required; `brainstorm.md` lists grapheme safety as out of scope. Use `Array.from(s).slice(...)` if it ever matters.

**4. Non-string `s` throws.**
- `truncate(undefined, 3)` / `truncate(null, 3)` / `truncate(123, 3)` → `TypeError`. Expected for an untyped helper. No action.

## Open questions for the PR reviewer

1. Which contract wins, product line (a) or seeded tests (b)? One-word answer resolves finding 1.
2. Whichever wins, make test file and task text agree in this PR so the next walk does not re-litigate.

## Assessment

**Ready to merge:** No.

Implementation is correct against the task and docs are accurate. Suite is 2/3 red because the requirement and the committed tests disagree. Outcome: changes requested, pending the contract decision above.
