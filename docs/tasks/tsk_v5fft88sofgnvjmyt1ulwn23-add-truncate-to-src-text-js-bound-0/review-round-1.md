# Review round 1: `truncate(s, n)` in `src/text.js`

Stage: review (Reviewer). Range: `cd2c324..4f9e60d`. Verdict: **changes requested**.

## Test run

`npm test` on `4f9e60d`, exit code 1:

```
✔ slugify
✖ truncate keeps n characters, then an ellipsis
✖ truncate leaves a short string alone
ℹ tests 3  pass 1  fail 2

test/text.test.js:7   'ab…' !== 'abc…'
test/text.test.js:10  'ab…' !== 'ab'
```

## Strengths

- `src/text.js:5-7` is exactly the product formula: one line, no branches, named ESM export, same style as `slugify`.
- Scope held: only `src/text.js` plus task docs changed. Tests untouched as the task required.
- `brainstorm.md` and `implement.md` predicted both failures with the exact wrong outputs before the suite was run. Prediction table matches real output.

## Findings

### Critical

**1. Suite is red: both seeded truncate tests fail.**
- Where: `src/text.js:6` vs `test/text.test.js:7` and `:10`.
- Failure: `truncate('abcdef', 3)` returns `'ab…'`, test expects `'abc…'`. `truncate('ab', 3)` returns `'ab…'`, test expects `'ab'`.
- Cause: the product formula and the seeded tests describe two different functions. The code follows the task text. The branch cannot merge with a failing suite regardless of which side is right.
- Fix, one of:
  - (a) keep the formula, change the two assertions in `test/text.test.js` to expect `'ab…'` and `'ab…'`;
  - (b) replace line 6 with `return s.length <= n ? s : s.slice(0, n) + '…';` (still one line; verified it passes both seeded tests).
  - Recommend (b) unless product has a stated reason for `n - 1` and the unconditional ellipsis. It also removes findings 2 and 3 below.

### Important

**2. Ellipsis appended to strings that were never cut.**
- Where: `src/text.js:6`.
- Failure: `truncate('ab', 3)` → `'ab…'`; `truncate('abc', 3)` → `'ab…'` (loses a char and gains an ellipsis); `truncate('abcdef', 100)` → `'abcdef…'` (output longer than input); `truncate('', 3)` → `'…'`.
- Consequence: callers and UIs read the ellipsis as "content elided" when nothing was.
- Fix: option (b) above. Originates in the task's "in every case, no other branches" clause, so this is a requirement defect; product should confirm.

**3. `n <= 0` produces longer output, not shorter.**
- Where: `src/text.js:6`.
- Failure: `truncate('abcdef', 0)` → `'abcde…'` (negative-index `slice` keeps 5 of 6); `truncate('abcdef', -1)` → `'abcd…'`. `truncate('abcdef', undefined)` → `'…'`.
- Consequence: `n = 0` from a computed width returns nearly the whole string instead of nothing.
- Fix: option (b) gives `'…'` for `n = 0`, which is at least monotonic. If the formula stays, document `n >= 1` as a precondition on the function.

### Minor

**4. Semantics of `n` undocumented.** Formula treats `n` as total output length including the ellipsis; the test name treats it as kept-character count. Whichever wins, add a one-line JSDoc stating it. `src/text.js:5`.

**5. Non-string `s` throws.** `truncate(123, 3)` → `TypeError: s.slice is not a function`. Same class as `slugify(123)`; consistent with the module; declared out of scope. Note only.

**6. Surrogate pairs split.** `truncate('😀😀😀', 2)` returns a lone high surrogate plus ellipsis. Also true of option (b). Declared out of scope. Note only.

**7. `implement.md:3` labels the procedure "test-driven-development"** but no RED/GREEN cycle was observed (suite not run, no test written). The deviations section is honest about it; cosmetic mislabel.

## Open question for the PR reviewer

Pick (a) or (b) in finding 1. Not an engineering call; the task text and the seeded tests are both written statements of intent and they conflict. Reviewer recommendation: (b).

## Assessment

**Ready to merge:** No. Implementation matches the task text faithfully, but the task text contradicts the repository's only executable spec, so `npm test` fails 2 of 3. Resolve finding 1 before merge.
