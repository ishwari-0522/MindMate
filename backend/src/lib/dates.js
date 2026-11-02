import { z } from "zod";

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD").refine((s) => {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}, "Invalid date");

export const localDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Expected YYYY-MM-DDTHH:mm");

export function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Monday=0 ... Sunday=6
export function weekdayIndex(dateStr) {
  return (new Date(`${dateStr}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function mondayOf(dateStr) {
  return addDays(dateStr, -weekdayIndex(dateStr));
}

// The browser's local clock is the source of truth for "today"; the server's own clock is only a fallback.
export function resolveNow(nowParam) {
  const now = nowParam ?? new Date().toISOString().slice(0, 16);
  return { today: now.slice(0, 10), time: now.slice(11, 16) };
}

export function timeLabel(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function relativeDayLabel(dateStr, today) {
  if (dateStr === today) return "Today";
  if (dateStr === addDays(today, 1)) return "Tomorrow";
  const d = new Date(`${dateStr}T00:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}
