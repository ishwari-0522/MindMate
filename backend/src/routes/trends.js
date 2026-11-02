import { Router } from "express";
import { z } from "zod";
import { HttpError, requireAuth } from "../middleware/index.js";
import { JournalEntry, MoodEntry } from "../models/index.js";
import { MOOD_VALUE } from "../lib/scoring.js";
import { addDays, isoDate, mondayOf } from "../lib/dates.js";
import { weekdayWeekendPatterns } from "../lib/patterns.js";

const router = Router();
router.use(requireAuth);

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WINDOW_DAYS = { week: 7, month: 28, year: 365 };

const avg = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);
const round2 = (n) => (n === null ? null : Math.round(n * 100) / 100);

router.get("/", async (req, res) => {
  const { range, today, weekOf } = z
    .object({ range: z.enum(["week", "month", "year"]).default("week"), today: isoDate, weekOf: isoDate.optional() })
    .parse(req.query);
  if (weekOf && weekOf > today) throw new HttpError(400, "You can't view a week that hasn't happened yet");

  // `weekOf` (any date in the week) lets the week chart step back through earlier weeks. Without it, "week"
  // means the last 7 days, as before. Streak and weekday/weekend patterns always count back from today.
  const viewingWeek = range === "week" && Boolean(weekOf);
  const days = WINDOW_DAYS[range];
  const windowStart = viewingWeek ? mondayOf(weekOf) : addDays(today, -(days - 1));
  const windowEnd = viewingWeek ? [addDays(windowStart, 6), today].sort()[0] : today;
  const prevStart = viewingWeek ? addDays(windowStart, -7) : addDays(today, -(2 * days - 1));
  // One bounded query feeds the bars, averages and streak; at most ~730 small documents.
  const fetchFrom = [prevStart, addDays(today, -399), `${today.slice(0, 4)}-01-01`].sort()[0];

  const entries = await MoodEntry.find({ userId: req.userId, date: { $gte: fetchFrom, $lte: today } })
    .select("-_id date mood")
    .lean();
  const byDate = new Map(entries.map((e) => [e.date, MOOD_VALUE[e.mood]]));

  let bars;
  if (range === "week") {
    const monday = viewingWeek ? windowStart : mondayOf(today);
    bars = WEEK_LABELS.map((label, i) => ({ label, value: byDate.get(addDays(monday, i)) ?? 0 }));
  } else if (range === "month") {
    bars = [0, 1, 2, 3].map((w) => {
      const vals = [];
      for (let d = 0; d < 7; d++) {
        const v = byDate.get(addDays(windowStart, w * 7 + d));
        if (v) vals.push(v);
      }
      return { label: `Wk ${w + 1}`, value: round2(avg(vals)) ?? 0 };
    });
  } else {
    const year = today.slice(0, 4);
    bars = MONTH_LABELS.map((label, i) => {
      const prefix = `${year}-${String(i + 1).padStart(2, "0")}-`;
      const vals = [...byDate].filter(([d]) => d.startsWith(prefix)).map(([, v]) => v);
      return { label, value: round2(avg(vals)) ?? 0 };
    });
  }

  const valuesBetween = (from, to) => [...byDate].filter(([d]) => d >= from && d <= to).map(([, v]) => v);
  const current = valuesBetween(windowStart, windowEnd);
  const previous = valuesBetween(prevStart, addDays(windowStart, -1));
  const curAvg = avg(current);
  const prevAvg = avg(previous);
  const changePct = curAvg !== null && prevAvg !== null ? Math.round(((curAvg - prevAvg) / prevAvg) * 100) : null;

  let streak = 0;
  let cursor = byDate.has(today) ? today : addDays(today, -1);
  while (byDate.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  const [top] = await JournalEntry.aggregate([
    { $match: { userId: req.userId, date: { $gte: windowStart, $lte: windowEnd } } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 1 },
  ]);

  const weekStart = viewingWeek ? windowStart : mondayOf(today);
  res.json({
    range,
    week: range === "week" ? { start: weekStart, end: addDays(weekStart, 6) } : null,
    bars,
    avgMood: round2(curAvg),
    loggedDays: current.length,
    changePct,
    streak,
    topTrigger: top?._id ?? null,
    patterns: weekdayWeekendPatterns(byDate, today),
  });
});

export default router;
