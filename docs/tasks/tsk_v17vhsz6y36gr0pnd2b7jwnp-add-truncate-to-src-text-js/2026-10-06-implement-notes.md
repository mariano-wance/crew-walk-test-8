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

## Repair round 1

Addressed `review-round-1.md` findings #1 (Critical) and #2 (Important).

- `src/text.js`: `return s.length <= n ? s : s.slice(0, Math.max(n, 0)) + '…';`
  Took reviewer option (a). Keeps the seeded tests as they are and does not
  weaken them. This departs from the product formula ("no other branches"):
  it is still one line, but has one conditional and one clamp.
- `test/text.test.js`: added `truncate('abcdef', 0) → '…'` and
  `truncate('abcdef', -1) → '…'`.
- RED (checked with `node -e` on the old code): `('abcdef',3)→'ab…'`, `('ab',3)→'ab…'`,
  `('abcdef',0)→'abcde…'`. With the reviewer's ternary only, `('abcdef',-1)` still gave
  `'abcde…'`, so I added `Math.max(n, 0)`.
- GREEN (checked with `node -e`, not the full suite, which the task says not to run):
  `('abcdef',3)→'abc…'`, `('ab',3)→'ab'`, `('abc',3)→'abc'`, `('abcdef',100)→'abcdef'`,
  `('',3)→''`, `('abcdef',0)→'…'`, `('abcdef',-1)→'…'`, `('abcdef',-2)→'…'`.
- Minor #3–#5 not changed. They are out of scope per the design doc.

### Open question (for PR reviewer)

Product said to use `s.slice(0, n - 1) + '…'` with no branches. This repair
replaces that with standard truncation so the pre-existing tests pass.
Product needs to confirm. If product keeps the original formula, revert
`src/text.js` and rewrite the seeded tests instead (reviewer option b).
