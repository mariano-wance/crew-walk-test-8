# Add `truncate(s, n)` to `src/text.js`

Stage: brainstorm (Analyst). Date: 2026-10-06. Path: bounded.

## What was asked

Add and export `truncate(s, n)` from `src/text.js`.

Product decided the implementation: return `s.slice(0, n - 1) + '…'` in every
case. One line. No other branches. Implementation must not run the test suite;
review runs it.

## What exists today

- `src/text.js` exports one function, `slugify(s)`. ES module (`"type": "module"`).
- `test/text.test.js` already imports `truncate` and seeds two tests for it
  (commit `cd2c324`):

  | call                   | seeded test expects |
  |------------------------|---------------------|
  | `truncate('abcdef', 3)` | `'abc…'`            |
  | `truncate('ab', 3)`     | `'ab'`              |

- Test runner: `node --test` (no deps).

## Decided (from the task, not inferred)

- Signature: `truncate(s, n)`, named export, in `src/text.js`.
- Body: `return s.slice(0, n - 1) + '…';`
- Single branch. No short-string guard. No input validation.
- Implement stage does not run `npm test`.

## Inferred (Analyst's reading)

- Ellipsis is the single Unicode character `…` (U+2026), as in the task text
  and the seeded test, not three ASCII dots.
- Place `truncate` after `slugify` in the same file. No new files.
- No JSDoc or comments needed. Matches `slugify` style.

## Behavior of the decided formula (verified with node)

| input              | output     |
|--------------------|------------|
| `('abcdef', 3)`    | `'ab…'`    |
| `('ab', 3)`        | `'ab…'`    |
| `('abcdef', 6)`    | `'abcde…'` |
| `('abcdef', 7)`    | `'abcdef…'`|
| `('abc', 1)`       | `'…'`      |
| `('abc', 0)`       | `'ab…'` (negative slice end) |
| `('', 3)`          | `'…'`      |

## Open question: product formula contradicts seeded tests

Both seeded `truncate` tests fail under the product-decided formula:

| test                                        | expects  | formula gives |
|---------------------------------------------|----------|---------------|
| `truncate keeps n characters, then an ellipsis` | `'abc…'` | `'ab…'`       |
| `truncate leaves a short string alone`      | `'ab'`   | `'ab…'`       |

The test names describe different semantics: keep `n` chars (not `n - 1`),
and leave strings of length `<= n` untouched (needs a branch).

Analyst's call: the task states the implementation is decided by product and
is explicit about "every case" and "no other branches". The spec therefore
follows the product decision as written. The implement stage must not edit
the tests to make them pass (not in scope) and must not add a branch.

Review will run the suite and see two red tests. The pull request reviewer
decides between:

1. Keep product formula, update the two seeded tests to match the table above.
2. Change product decision to match the tests:
   `return s.length <= n ? s : s.slice(0, n) + '…';` (one line, but a branch).

Second open question, lower stakes: `n <= 0` yields odd results via negative
slice. Product said no branches, so left as is.

## Out of scope

- Changing or deleting the seeded tests.
- Input validation (`n` non-integer, `s` not a string).
- Grapheme-aware or word-boundary truncation.
- Any change to `slugify`.
- Running the test suite during implement.

## Files touched by implement

- `src/text.js`: add one exported function.

Nothing else.
