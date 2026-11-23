export const STORAGE_KEY = 'mona-bookmarks';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9a-zA-Z]{4}$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError('A URL is required.');
  }

  const input = value.trim();
  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(input);
  const isHostPort = /^[^/?#]+:\d+(?:[/?#]|$)/.test(input);

  if (hasScheme && !/^https?:\/\//i.test(input) && !isHostPort) {
    throw new TypeError('Only HTTP and HTTPS URLs are supported.');
  }

  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || !url.hostname) {
    throw new TypeError('A valid HTTP or HTTPS URL is required.');
  }

  return url.href;
}

export function generateSlug(random = Math.random) {
  let suffix = '';
  for (let index = 0; index < 4; index += 1) {
    suffix += BASE62[Math.floor(random() * BASE62.length)];
  }
  return `mona-${suffix}`;
}

export function formatBookmark(bookmark) {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

function isBookmark(value) {
  if (
    value === null ||
    typeof value !== 'object' ||
    typeof value.url !== 'string' ||
    typeof value.slug !== 'string' ||
    !SLUG_PATTERN.test(value.slug)
  ) {
    return false;
  }

  try {
    normalizeUrl(value.url);
    return true;
  } catch {
    return false;
  }
}

export function loadBookmarks(serialized) {
  if (typeof serialized !== 'string' || serialized.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isBookmark)
      .map(({ url, slug }) => ({ url: normalizeUrl(url), slug }));
  } catch {
    return [];
  }
}
