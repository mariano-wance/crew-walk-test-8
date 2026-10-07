import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, truncate } from '../src/text.js';

test('slugify', () => assert.equal(slugify(' A b '), 'a-b'));
test('truncate keeps n characters, then an ellipsis', () => {
  assert.equal(truncate('abcdef', 3), 'abc…');
});
test('truncate leaves a short string alone', () => {
  assert.equal(truncate('ab', 3), 'ab');
});
test('truncate to zero keeps only the ellipsis', () => {
  assert.equal(truncate('abcdef', 0), '…');
});
test('truncate to a negative length keeps only the ellipsis', () => {
  assert.equal(truncate('abcdef', -1), '…');
});
