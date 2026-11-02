import { Router } from "express";
import { z } from "zod";
import { HttpError, requireAuth } from "../middleware/index.js";
import { JournalEntry } from "../models/index.js";
import { MOODS } from "../lib/scoring.js";
import { isoDate } from "../lib/dates.js";

const router = Router();
router.use(requireAuth);

const entrySchema = z.object({
  date: isoDate,
  period: z.enum(["Morning entry", "Afternoon entry", "Evening entry"]),
  mood: z.enum(MOODS),
  text: z.string().trim().max(5000).default(""),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
});

const toDto = (e) => ({
  id: e._id.toString(),
  date: e.date,
  period: e.period,
  mood: e.mood,
  text: e.text,
  tags: e.tags,
});

router.get("/", async (req, res) => {
  const { limit, from, to } = z
    .object({
      limit: z.coerce.number().int().min(1).max(200).default(50),
      from: isoDate.optional(),
      to: isoDate.optional(),
    })
    .parse(req.query);
  // from/to let the calendar ask for just the month it is showing.
  const filter = { userId: req.userId };
  if (from || to) filter.date = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  const entries = await JournalEntry.find(filter).sort({ date: -1, createdAt: -1 }).limit(limit);
  res.json({ entries: entries.map(toDto) });
});

router.post("/", async (req, res) => {
  const data = entrySchema.parse(req.body);
  const entry = await JournalEntry.create({ ...data, userId: req.userId });
  res.status(201).json({ entry: toDto(entry) });
});

router.put("/:id", async (req, res) => {
  const data = entrySchema.parse(req.body);
  const entry = await JournalEntry.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, data, { returnDocument: "after" });
  if (!entry) throw new HttpError(404, "Entry not found");
  res.json({ entry: toDto(entry) });
});

router.delete("/:id", async (req, res) => {
  const result = await JournalEntry.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) throw new HttpError(404, "Entry not found");
  res.json({ ok: true });
});

export default router;
