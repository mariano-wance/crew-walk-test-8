# Review round 2: `truncate(s, n)`

Stage: review (Reviewer). Date: 2026-10-06. Range: `2fe3afc..448760d` (repair),
whole change `cd2c324..448760d`.

## Verdict

**Completed.** No Critical or Important findings. One Minor test gap.

`npm test` (`node --test`): 5 tests, 5 pass, 0 fail.

```
✔ slugify
✔ truncate keeps n characters, then an ellipsis
✔ truncate leaves a short string alone
✔ truncate to zero keeps only the ellipsis
✔ truncate to a negative length keeps only the ellipsis
ℹ tests 5  ℹ pass 5  ℹ fail 0
```

## Round-1 findings status

| # | Severity | Status | Evidence |
|---|----------|--------|----------|
| 1 | Critical | Addressed | `src/text.js:6` now `s.length <= n ? s : s.slice(0, Math.max(n, 0)) + '…'`. `('abcdef',3)→'abc…'`, `('ab',3)→'ab'`, `('abc',3)→'abc'`, `('abcdef',100)→'abcdef'`, `('',3)→''`. Both seeded tests green. |
| 2 | Important | Addressed; engineer rebuttal correct | Round 1 said the ternary alone covered it. Wrong: with ternary only, `('abcdef',-1)→'abcde…'` (`-6 <= -1` false, `slice(0,-1)`). `Math.max(n, 0)` was needed. Now `n = 0, -1, -5, -Infinity` all `→'…'`. Tests added for `0` and `-1`. |
| 3 | Minor | Open, by design | Non-numeric `n`: `NaN/undefined→'…'`, `2.7→'ab…'`, `'3'→'abc…'`, `Infinity→'abcdef'`. Out of scope per design doc, no caller. |
| 4 | Minor | Open, by design | `('😀😀😀',3)→'😀\ud83d…'` (split surrogate). Out of scope, no caller. |
| 5 | Minor | Open, by design | `truncate(null,3)` throws `TypeError`. Same contract as `slugify`. |

## Strengths

- Engineer tested the reviewer's proposed fix instead of pasting it, found the
  negative-`n` hole, fixed it with a clamp, and wrote the counterexample into
  `review-round-1.md`. Correct handling of review feedback.
- Diff minimal: one line in `src/text.js`, two short tests, docs. `slugify`
  untouched.
- Deviation from product formula recorded in design doc, implement notes, and
  commit message, with revert path (option b). PR reviewer has what they need.
- Only caller of `truncate` is `test/text.test.js` (grep). No downstream effect.

## Findings

### Critical

None.

### Important

None.

### Minor

**1. Exact-fit boundary untested; `<=` → `<` mutation survives the suite.**
- Location: `test/text.test.js:9-11`.
- Failure: mutate `src/text.js:6` to `s.length < n`. All 5 tests still pass
  (verified in a temp copy), yet `truncate('abc', 3) → 'abc…'`: a string that
  already fits gets an ellipsis appended. Most likely off-by-one to be
  reintroduced in a future edit.
- Fix: one assertion, `assert.equal(truncate('abc', 3), 'abc');`, inside the
  "leaves a short string alone" test or as its own test.

## Callers checked

`grep -rn truncate` over `*.js`, `*.mjs`, `*.ts`: `src/text.js` and
`test/text.test.js` only.

## Open question for PR reviewer

Unchanged from round 1 and implement notes: product specified
`s.slice(0, n - 1) + '…'` with no branches. Current code is standard
truncation with a ternary and a clamp, chosen because the product formula
fails the pre-existing seeded tests and the function's name. Product confirms
(a) keep current code, or (b) revert `src/text.js` to the formula and rewrite
the four `truncate` tests. Reviewer recommends (a).
