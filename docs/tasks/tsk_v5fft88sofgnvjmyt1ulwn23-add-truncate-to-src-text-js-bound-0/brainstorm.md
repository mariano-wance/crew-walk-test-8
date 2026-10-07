# Brainstorm: add `truncate(s, n)` to `src/text.js`

Stage: brainstorm (Analyst). Path: **bounded**. The file and its test already exist; this is a one-function addition to an existing module.

## What was asked

Add and export `truncate(s, n)` from `src/text.js`.

Product decided the implementation: return `s.slice(0, n - 1) + '…'` in every case. One line, no branches. Do not run the test suite during implement; review runs it.

## What exists today

- `src/text.js` exports one function, `slugify(s)`. ESM (`"type": "module"`).
- `test/text.test.js` already imports `truncate` and has two tests for it (seeded in commit `cd2c324`):
  - `truncate('abcdef', 3)` must equal `'abc…'`
  - `truncate('ab', 3)` must equal `'ab'`
- Test runner: `node --test` (no dependencies).
- Nothing else references `truncate`.

## Design (decided)

Append to `src/text.js`, same style as `slugify`:

```js
export function truncate(s, n) {
  return s.slice(0, n - 1) + '…';
}
```

Files touched: `src/text.js` only. No new files, no dependencies, no changes to `test/text.test.js`.

Testing: none during implement, per the task. Review runs `npm test`.

## Scope

In: the one exported function above.

Out: changing `slugify`; editing or adding tests; input validation (non-string `s`, negative or non-integer `n`); handling surrogate pairs or grapheme clusters; any branch for short strings.

## Open question for the PR reviewer

**The product formula contradicts both seeded tests.** With `s.slice(0, n - 1) + '…'`:

| Call | Product formula returns | Seeded test expects |
|---|---|---|
| `truncate('abcdef', 3)` | `'ab…'` | `'abc…'` |
| `truncate('ab', 3)` | `'ab…'` | `'ab'` |

So `npm test` will fail at review with this implementation. The seeded tests describe a different function: keep `n` characters, append `…` only when the input is longer than `n`. That version would be:

```js
export function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n) + '…';
}
```

Decision taken for this task: follow the product decision as written, because it is the explicit instruction and it forbids branches. The test file is left untouched since the task does not mention it.

What I inferred, not decided: that "bound 0" in the title is a harness label and carries no requirement.

The reviewer must pick one: (a) keep the product formula and update the two seeded tests to match, or (b) override product and ship the branching version that the tests already describe. I recommend (b) if product has no stated reason for `n - 1` and the unconditional ellipsis, since the tests are the only written statement of intended behavior from a caller's view.
