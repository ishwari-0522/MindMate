import { addDays, weekdayIndex } from "./dates.js";

const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);
const round2 = (n) => (n === null ? null : Math.round(n * 100) / 100);

const MIN_PER_GROUP = 3; // weekday vs weekend needs a few of each before it means anything
const MIN_FOR_VARIABILITY = 5;
const STEADY_BELOW = 0.7;
const MIXED_BELOW = 1.2;

// Looks at the last `days` days of mood values (1-5) for weekend vs weekday differences and how much mood swings.
export function weekdayWeekendPatterns(valueByDate, today, days = 56) {
  const weekday = [];
  const weekend = [];
  const saturday = [];
  const sunday = [];
  const all = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    const value = valueByDate.get(date);
    if (!value) continue;
    all.push(value);
    const dow = weekdayIndex(date); // Mon=0 ... Sun=6
    if (dow >= 5) weekend.push(value);
    else weekday.push(value);
    if (dow === 5) saturday.push(value);
    if (dow === 6) sunday.push(value);
  }

  const weekdayAvg = avg(weekday);
  const weekendAvg = avg(weekend);
  const enough = weekday.length >= MIN_PER_GROUP && weekend.length >= MIN_PER_GROUP;

  let variability = null;
  if (all.length >= MIN_FOR_VARIABILITY) {
    const mean = avg(all);
    const stdDev = Math.sqrt(avg(all.map((v) => (v - mean) ** 2)));
    variability = {
      stdDev: round2(stdDev),
      label: stdDev < STEADY_BELOW ? "steady" : stdDev < MIXED_BELOW ? "mixed" : "variable",
    };
  }

  return {
    days,
    weekday: { avg: round2(weekdayAvg), count: weekday.length },
    weekend: { avg: round2(weekendAvg), count: weekend.length },
    saturday: { avg: round2(avg(saturday)), count: saturday.length },
    sunday: { avg: round2(avg(sunday)), count: sunday.length },
    difference: enough ? round2(weekendAvg - weekdayAvg) : null,
    variability,
  };
}
