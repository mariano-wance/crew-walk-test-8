# Brainstorm: add `truncate(s, n)` to `src/text.js` (G08 walk)

Stage: brainstorm. Path: **bounded** (one new export in an existing one-function file). Unattended run, so the usual "present design, wait for yes" gate is replaced by this document plus the open questions below. The pull request reviewer decides them.

## What was asked (decided, verbatim)

- Add and export `truncate(s, n)` from `src/text.js`.
- Body decided by product: `return s.slice(0, n - 1) + '…'` in every case. One line. No other branches.
- Do not run the test suite during implement. Review runs it.

## What exists today

`src/text.js` exports one function, `slugify`. Style: ES module, named `export function`, single return line.

`test/text.test.js` (seed commit `cd2c324`) already imports `truncate` and asserts:

| Call | Test expects | Product line returns |
|---|---|---|
| `truncate('abcdef', 3)` | `'abc…'` | `'ab…'` |
| `truncate('ab', 3)` | `'ab'` | `'ab…'` |

Both existing `truncate` tests fail under the product-decided line. Today the whole test file fails to load anyway (named import of a missing export), so `slugify` is also red until `truncate` exists.

## Design

One line appended to `src/text.js`, same style as `slugify`:

```js
export function truncate(s, n) {
  return s.slice(0, n - 1) + '…';
}
```

Files touched: `src/text.js` only.

Tests: none added, none changed. The seeded tests stay as-is. Implement stage must not run `npm test`. Review stage runs it and will see the two `truncate` cases fail. That outcome is expected given the decided body, not a bug in the implementation.

## Decided vs inferred

- **Decided (by product, in the task):** the exact body, one line, no branches, no test run during implement.
- **Inferred (by me):** the seeded tests encode a different contract (keep `n` chars, leave short strings alone). I infer the task is intentionally shipping a body that contradicts them so review catches it. I did not resolve that conflict; see open questions.

## Out of scope

- Changing or deleting the seeded tests.
- Adding a short-string branch, length guard, or any input validation.
- Unicode / grapheme-safe slicing.
- Any change outside `src/text.js`.

## Open questions (for the PR reviewer)

1. **Tests vs product body.** The two cannot both hold. Options: (a) keep the product line, tests fail at review, reviewer decides; (b) change tests to match the product line (`'ab…'` for both); (c) change the body to match the tests, which breaks the "no other branches" rule. This stage chose (a) because the task is explicit and says review runs the tests. Needs a human call.
2. **`n - 1` vs `n`.** Product line cuts at `n - 1` so output length is `n` including the ellipsis. Tests assume `n` chars plus ellipsis. Confirm which length semantics product actually wants.
