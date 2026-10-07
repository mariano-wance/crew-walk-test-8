# Implement: `truncate(s, n)` in `src/text.js`

Stage: implement (Engineer). Procedure: test-driven-development.

## What was done

Appended to `src/text.js`, exactly the product formula:

```js
export function truncate(s, n) {
  return s.slice(0, n - 1) + '…';
}
```

No other files changed. `test/text.test.js` untouched.

## TDD deviations

- RED was already in place: `test/text.test.js` (commit `cd2c324`) imports `truncate`, which did not exist, so the suite failed at import before this change. No new test written — the seeded tests are the tests.
- Suite not run, per task instruction ("Do not run the test suite during implement; review runs it"). GREEN is unverified here.

## Expected at review (not run, derived by reading)

| Test | Expected | Product formula returns | Result |
|---|---|---|---|
| `slugify(' A b ')` | `'a-b'` | `'a-b'` | pass |
| `truncate('abcdef', 3)` | `'abc…'` | `'ab…'` | **fail** |
| `truncate('ab', 3)` | `'ab'` | `'ab…'` | **fail** |

## Open question for the PR reviewer

The product formula contradicts both seeded truncate tests (already flagged in `brainstorm.md`). Followed product as written because it is the explicit instruction and forbids branches. Reviewer picks one:

- (a) keep product formula, update the two tests to `'ab…'` / `'ab…'`;
- (b) override product with the version the tests describe:
  `return s.length <= n ? s : s.slice(0, n) + '…';`
