import { addDays } from "./dates.js";
import { LEVEL_COPY } from "../data/supportResources.js";

const LOW_MOODS = new Set(["low", "rough"]);

// Consecutive days of low/rough moods ending today (or yesterday, if today isn't logged yet).
export function lowStreak(moodByDate, today) {
  let cursor = moodByDate.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (LOW_MOODS.has(moodByDate.get(cursor))) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

const RECOVERED_MOODS = new Set(["good", "great"]);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const shortDate = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;

// The longest run of consecutive low/rough days that ended within the last `lookbackDays` days and hasn't been
// followed by a good or great day since. This is how a rough fortnight that has just ended is still noticed.
// Ties go to the most recent run. Returns null when lookbackDays is 0 or nothing qualifies.
export function pastLowRun(moodByDate, today, lookbackDays) {
  if (!lookbackDays) return null;
  const earliestEnd = addDays(today, -lookbackDays);
  const lowDates = [...moodByDate]
    .filter(([date, mood]) => LOW_MOODS.has(mood) && date <= today)
    .map(([date]) => date)
    .sort();
  const recoveredAfter = (end) =>
    [...moodByDate].some(([date, mood]) => date > end && date <= today && RECOVERED_MOODS.has(mood));

  let best = null;
  let run = null;
  const close = () => {
    if (run && run.end >= earliestEnd && !recoveredAfter(run.end) && (!best || run.length >= best.length)) best = run;
  };
  for (const date of lowDates) {
    if (run && addDays(run.end, 1) === date) {
      run.end = date;
      run.length++;
    } else {
      close();
      run = { start: date, end: date, length: 1 };
    }
  }
  close();
  return best;
}

// Decides how much support to offer from what the person has actually logged. Pure, so it is easy to test.
//   moods:      [{ date, mood }]            recent mood entries
//   screenings: [{ type, score, severity, selfHarmFlag }]  newest first, already limited to the recent window
//   crisisCount: number of recent chat messages that mentioned self-harm
export function assessLevel({ moods, screenings, crisisCount, today }, cfg) {
  const byDate = new Map(moods.map((m) => [m.date, m.mood]));
  const streak = lowStreak(byDate, today);

  const windowStart = addDays(today, -13);
  const last14 = moods.filter((m) => m.date >= windowStart && m.date <= today);
  const lowDaysLast14 = last14.filter((m) => LOW_MOODS.has(m.mood)).length;

  const phq9 = screenings.find((s) => s.type === "PHQ-9") ?? null;
  const gad7 = screenings.find((s) => s.type === "GAD-7") ?? null;
  const selfHarmFlag = screenings.some((s) => s.selfHarmFlag);

  let level = 0;
  const reasons = [];
  const raise = (to, reason) => {
    level = Math.max(level, to);
    reasons.push(reason);
  };

  const levelForDays = (days) =>
    days >= cfg.urgentLowDays ? 3 : days >= cfg.connectLowDays ? 2 : days >= cfg.gentleLowDays ? 1 : 0;

  const currentLevel = levelForDays(streak);
  if (currentLevel > 0) raise(currentLevel, `You've logged a low or rough mood ${streak} days in a row.`);

  // A stretch that has already ended still counts for a while, but helplines are kept for a streak that is
  // still going, so an ended run raises support to "connect" at most.
  const pastRun = pastLowRun(byDate, today, cfg.pastRunLookbackDays);
  const pastLevel = pastRun && pastRun.length > streak ? Math.min(levelForDays(pastRun.length), 2) : 0;
  if (pastLevel > currentLevel) {
    raise(pastLevel, `You logged a low or rough mood ${pastRun.length} days in a row (${shortDate(pastRun.start)} to ${shortDate(pastRun.end)}).`);
  }

  if (phq9) {
    const text = `Your latest PHQ-9 screening scored ${phq9.score} (${phq9.severity}).`;
    if (phq9.score >= cfg.phq9Urgent) raise(3, text);
    else if (phq9.score >= cfg.phq9Connect) raise(2, text);
  }
  if (gad7 && gad7.score >= cfg.gad7Connect) {
    raise(2, `Your latest GAD-7 screening scored ${gad7.score} (${gad7.severity}).`);
  }
  if (selfHarmFlag) raise(3, "A recent screening answer mentioned thoughts of harming yourself.");
  if (crisisCount > 0) raise(3, "Something in a recent chat suggested you may be in distress.");

  return {
    level,
    reasons,
    signals: {
      lowStreak: streak,
      pastRun: pastLevel > 0 ? pastRun : null,
      lowDaysLast14,
      loggedLast14: last14.length,
      phq9: phq9 && { score: phq9.score, severity: phq9.severity },
      gad7: gad7 && { score: gad7.score, severity: gad7.severity },
      selfHarmFlag,
      crisisChat: crisisCount > 0,
    },
  };
}

export const daySeed = (today) => Math.floor(new Date(`${today}T00:00:00Z`).getTime() / 86400000);

// Shows a different, stable set each day, so suggestions stay fresh but don't shuffle on every reload.
export function pickRotating(items, count, seed) {
  if (items.length === 0) return [];
  const n = Math.min(count, items.length);
  const start = (Math.abs(seed) * n) % items.length;
  return Array.from({ length: n }, (_, i) => items[(start + i) % items.length]);
}

const toItem = (r) => ({
  id: r.key,
  title: r.title,
  description: r.description,
  url: r.url ?? null,
  phone: r.phone ?? null,
  hours: r.hours ?? null,
  languages: r.languages ?? [],
  mapsQuery: r.mapsQuery ?? null,
  kind: r.kind,
});

const PER_GROUP = 3;

// What to show for a level. Everyone can browse gentle ideas; professional websites need level 2+;
// helplines are only included at level 3.
export function buildGuidance({ assessment, resources, today }) {
  const { level, reasons, signals } = assessment;
  const effective = Math.max(level, 1);
  const seed = daySeed(today);
  const pool = (kind, minLevel = effective) =>
    resources.filter((r) => r.kind === kind && r.active !== false && (r.minLevel ?? 1) <= minLevel);
  const pick = (kind) => pickRotating(pool(kind), PER_GROUP, seed).map(toItem);

  const copy = LEVEL_COPY[level];
  return {
    level,
    levelName: copy.name,
    headline: copy.headline,
    message: copy.message,
    reasons,
    signals,
    suggestions: {
      activities: pick("activity"),
      places: pick("place"),
      advice: pick("advice"),
    },
    platforms: level >= 2 ? pool("platform", level).map(toItem) : [],
    helplines:
      level >= 3
        ? resources
            .filter((r) => (r.kind === "emergency" || r.kind === "helpline") && r.active !== false)
            .sort((a, b) => a.order - b.order)
            .map(toItem)
        : [],
  };
}
