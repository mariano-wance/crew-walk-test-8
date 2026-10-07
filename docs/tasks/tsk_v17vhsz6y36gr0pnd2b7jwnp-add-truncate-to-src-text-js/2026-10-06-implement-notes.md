# Implement notes: `truncate(s, n)`

Stage: implement (Engineer). Date: 2026-10-06.

## Done

- `src/text.js`: added `export function truncate(s, n) { return s.slice(0, n - 1) + '…'; }`.
  Exactly the product-decided formula, no branches.

## TDD record

- RED: seeded tests in `test/text.test.js` (commit `cd2c324`) already import
  `truncate`. Before the change, `import('./src/text.js')` gave
  `typeof truncate === 'undefined'`, so the module had no export to satisfy them.
- GREEN: not run. The task forbids running the test suite during implement;
  review runs it. Spot-checked with `node -e` instead:
  `truncate('abcdef', 3) → 'ab…'`, `truncate('ab', 3) → 'ab…'`,
  `truncate('abcdef', 6) → 'abcde…'`, matching the design doc table.

## Expected at review

Both seeded `truncate` tests will fail (`'ab…'` vs `'abc…'`, `'ab…'` vs `'ab'`).
This is the open question already recorded in `2026-10-06-truncate-design.md`:
product formula contradicts the seeded tests. Tests left untouched (out of scope).

## Open questions (for PR reviewer)

1. Product formula vs seeded tests — pick one:
   keep formula and update tests, or switch to
   `return s.length <= n ? s : s.slice(0, n) + '…';`.
2. `n <= 0` yields odd output via negative slice end (`truncate('abc', 0) → 'ab…'`).
   Left as is per "no other branches".
