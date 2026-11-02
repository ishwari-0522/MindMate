import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/index.js";
import { MoodEntry } from "../models/index.js";
import { MOODS } from "../lib/scoring.js";
import { addDays, isoDate } from "../lib/dates.js";
import { HttpError } from "../middleware/index.js";

const router = Router();
router.use(requireAuth);

const rangeSchema = z.object({ from: isoDate.optional(), to: isoDate.optional() });

router.get("/", async (req, res) => {
  const { from, to } = rangeSchema.parse(req.query);
  const filter = { userId: req.userId };
  if (from || to) filter.date = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  const entries = await MoodEntry.find(filter).sort({ date: 1 }).select("-_id date mood").limit(2000).lean();
  res.json({ moods: entries });
});

router.put("/:date", async (req, res) => {
  const date = isoDate.parse(req.params.date);
  const { mood } = z.object({ mood: z.enum(MOODS) }).parse(req.body);
  // Allow one day ahead so users in timezones ahead of the server can still log "today".
  if (date > addDays(new Date().toISOString().slice(0, 10), 1)) {
    throw new HttpError(400, "You can't log a mood in the future");
  }
  const entry = await MoodEntry.findOneAndUpdate(
    { userId: req.userId, date },
    { $set: { mood } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  )
    .select("-_id date mood")
    .lean();
  res.json({ mood: entry });
});

export default router;
