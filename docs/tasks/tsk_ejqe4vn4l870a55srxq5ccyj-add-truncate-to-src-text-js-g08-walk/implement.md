# Implement: `truncate(s, n)` in `src/text.js`

Stage: implement (TDD skill). Unattended.

## What changed

`src/text.js` gains one export, body exactly as product decided:

```js
export function truncate(s, n) {
  return s.slice(0, n - 1) + '…';
}
```

No other files touched. No tests added or changed.

## TDD notes

- RED already exists: seed commit `cd2c324` added `test/text.test.js`, which imports `truncate` (missing export, so the whole file failed to load).
- GREEN not verified here: the task forbids running the suite during implement; review runs it.
- Expected at review: `slugify` test passes (file now loads). Both `truncate` tests fail, because the decided body returns `'ab…'` where tests expect `'abc…'` and `'ab'`. This is the known conflict from `brainstorm.md`, not an implementation bug.

## Open questions (for the PR reviewer)

1. Tests vs product body conflict (see `brainstorm.md` Q1/Q2). Kept product body verbatim; did not edit tests. Reviewer picks: update tests to the product contract, or change the body (breaks "no other branches").
2. Edge inputs: `n <= 0` gives `slice(0, -1)`-style results (e.g. `truncate('abc', 0)` → `'ab…'`). Left as-is per "no other branches".

## Repair round 1

Addresses `review-round-1.md` finding 1 (Important). Took option (a): the task text is an explicit product decision (`s.slice(0, n - 1) + '…'`, no other branches), so the seeded tests were aligned to it rather than the body changed.

- `test/text.test.js`: `truncate('abcdef', 3)` now expects `'ab…'`; `truncate('ab', 3)` now expects `'ab…'`. Test names updated to state the product contract (`n` = output length incl. ellipsis, ellipsis always appended).
- `src/text.js`: unchanged.
- Suite not run here (task forbids it during implement); expected 3/3 green at review.
- Minor findings 2-4: no action, consistent with the review ("no fix required" under "no other branches").

### Open question (for the PR reviewer)

1. If product actually wants the seeded contract (keep `n` chars, leave short strings alone), revert the test change and use `return s.length > n ? s.slice(0, n) + '…' : s;` and amend the task text.
