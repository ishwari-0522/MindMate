const pad = (n) => String(n).padStart(2, "0");

// All dates sent to the API are the user's LOCAL calendar dates (toISOString would shift them to UTC).
export function toISODate(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localNow() {
  const d = new Date();
  return `${toISODate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso, n) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function formatShortDate(isoOrDate) {
  const d = typeof isoOrDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate) ? parseISODate(isoOrDate) : new Date(isoOrDate);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
