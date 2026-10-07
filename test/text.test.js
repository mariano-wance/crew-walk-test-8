import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, truncate } from '../src/text.js';

test('slugify', () => assert.equal(slugify(' A b '), 'a-b'));
test('truncate keeps n - 1 characters, then an ellipsis', () => {
  assert.equal(truncate('abcdef', 3), 'ab…');
});
test('truncate always appends the ellipsis, even to a short string', () => {
  assert.equal(truncate('ab', 3), 'ab…');
});
