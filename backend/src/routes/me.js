import { Router } from "express";
import { z } from "zod";
import { requireAuth, clearSession } from "../middleware/index.js";
import { Booking, ChatMessage, JournalEntry, MoodEntry, Screening, User } from "../models/index.js";

const router = Router();
router.use(requireAuth);

const patchSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60).optional(),
    notifications: z
      .object({
        dailyCheckin: z.boolean().optional(),
        weeklySummary: z.boolean().optional(),
        aiTips: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

router.patch("/", async (req, res) => {
  const { firstName, notifications } = patchSchema.parse(req.body);
  if (firstName) req.user.firstName = firstName;
  if (notifications) {
    for (const [key, value] of Object.entries(notifications)) req.user.notifications[key] = value;
  }
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

router.get("/export", async (req, res) => {
  const userId = req.userId;
  const [moods, journal, screenings, chat, bookings] = await Promise.all([
    MoodEntry.find({ userId }).sort({ date: 1 }).select("-_id date mood").lean(),
    JournalEntry.find({ userId }).sort({ date: 1 }).select("-userId -__v").lean(),
    Screening.find({ userId }).sort({ createdAt: 1 }).select("-userId -__v").lean(),
    ChatMessage.find({ userId }).sort({ createdAt: 1 }).select("role text createdAt -_id").lean(),
    Booking.find({ userId }).sort({ date: 1 }).select("-userId -__v").lean(),
  ]);
  res.setHeader("Content-Disposition", 'attachment; filename="mindmate-clinical-records.json"');
  res.json({
    exportedAt: new Date().toISOString(),
    profile: req.user.toPublic(),
    moods,
    journal,
    screenings,
    chat,
    bookings,
  });
});

router.delete("/", async (req, res) => {
  const userId = req.userId;
  await Promise.all([
    MoodEntry.deleteMany({ userId }),
    JournalEntry.deleteMany({ userId }),
    Screening.deleteMany({ userId }),
    ChatMessage.deleteMany({ userId }),
    Booking.deleteMany({ userId }),
  ]);
  await User.deleteOne({ _id: userId });
  clearSession(res);
  res.json({ ok: true });
});

export default router;
