export function slugify(s) {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
}

export function truncate(s, n) {
  return s.slice(0, n - 1) + '…';
}
