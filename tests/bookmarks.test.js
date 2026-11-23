import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatBookmark,
  generateSlug,
  loadBookmarks,
  normalizeUrl,
} from '../src/utils/bookmarks.js';

test('normalizes URLs with or without https:// to the same value', () => {
  assert.equal(normalizeUrl('https://www.example.com/path'), normalizeUrl('www.example.com/path'));
  assert.equal(normalizeUrl('www.example.com/path'), 'https://www.example.com/path');
});

test('generates a short base62 slug with the mona- prefix', () => {
  assert.equal(generateSlug(() => 0), 'mona-0000');
  assert.match(generateSlug(() => 0.99), /^mona-[0-9a-zA-Z]{4}$/);
});

test('recovers from empty, corrupted, legacy, and non-array storage values', () => {
  const legacyValue = JSON.stringify(['https://www.example.com']);
  const nonArrayValue = JSON.stringify({ url: 'https://www.example.com', slug: 'mona-7fk2' });

  for (const value of [null, '', 'not json', legacyValue, nonArrayValue]) {
    assert.doesNotThrow(() => loadBookmarks(value));
    assert.deepEqual(loadBookmarks(value), []);
  }
});

test('drops malformed records and keeps validated bookmarks', () => {
  const stored = JSON.stringify([
    { url: 'example.com', slug: 'mona-7fk2' },
    { url: 'javascript:alert(1)', slug: 'mona-1234' },
    { url: 'https://example.com', slug: 'legacy-slug' },
    { url: 'https://example.org', slug: 'mona-AB12', extra: true },
  ]);

  assert.deepEqual(loadBookmarks(stored), [
    { url: 'https://example.com/', slug: 'mona-7fk2' },
    { url: 'https://example.org/', slug: 'mona-AB12' },
  ]);
});

test('formats a bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});
