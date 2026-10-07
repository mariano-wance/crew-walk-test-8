export function slugify(s) {
  return s.trim().toLowerCase().replace(/\s+/g, '-');
}

export function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, Math.max(n, 0)) + '…';
}
