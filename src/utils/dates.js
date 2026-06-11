export function nightsBetween(start, end) {
  const nights = Math.ceil((new Date(end) - new Date(start)) / 86400000);
  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '—';
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-IN', { ...defaults, ...options });
}

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
