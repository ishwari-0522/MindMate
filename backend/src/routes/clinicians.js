import { Router } from "express";
import { z } from "zod";
import { HttpError, requireAuth } from "../middleware/index.js";
import { Booking, Clinician } from "../models/index.js";
import { addDays, isoDate, localDateTime, relativeDayLabel, resolveNow, timeLabel } from "../lib/dates.js";

const router = Router();
router.use(requireAuth);

const CATEGORIES = ["Anxiety", "Depression", "Stress", "Grief"];
const LOOKAHEAD_DAYS = 14;

const isFuture = (date, time, now) => date > now.today || (date === now.today && time > now.time);

async function bookedKeys(clinicianIds, from, to) {
  const bookings = await Booking.find({
    clinicianId: { $in: clinicianIds },
    status: "confirmed",
    date: { $gte: from, $lte: to },
  })
    .select("clinicianId date time")
    .lean();
  return new Set(bookings.map((b) => `${b.clinicianId}|${b.date}|${b.time}`));
}

router.get("/", async (req, res) => {
  const { category, now: nowParam } = z
    .object({ category: z.enum(CATEGORIES).optional(), now: localDateTime.optional() })
    .parse(req.query);
  const now = resolveNow(nowParam);

  const clinicians = await Clinician.find(category ? { tags: category } : {}).sort({ rating: -1, name: 1 }).lean();
  const taken = await bookedKeys(
    clinicians.map((c) => c._id),
    now.today,
    addDays(now.today, LOOKAHEAD_DAYS)
  );

  const result = clinicians.map((c) => {
    let nextSlot = null;
    for (let d = 0; d <= LOOKAHEAD_DAYS && !nextSlot; d++) {
      const date = addDays(now.today, d);
      const time = [...c.slotTimes]
        .sort()
        .find((t) => isFuture(date, t, now) && !taken.has(`${c._id}|${date}|${t}`));
      if (time) nextSlot = { date, time, label: `${relativeDayLabel(date, now.today)}, ${timeLabel(time)}` };
    }
    return {
      id: c._id.toString(),
      name: c.name,
      specialty: c.specialty,
      tags: c.tags,
      rating: c.rating,
      reviewCount: c.reviewCount,
      initials: c.initials,
      color: c.color,
      nextSlot,
    };
  });
  res.json({ clinicians: result });
});

router.get("/:id/slots", async (req, res) => {
  const { date, now: nowParam } = z.object({ date: isoDate, now: localDateTime.optional() }).parse(req.query);
  const now = resolveNow(nowParam);
  const clinician = await Clinician.findById(req.params.id).lean();
  if (!clinician) throw new HttpError(404, "Clinician not found");

  const taken = await bookedKeys([clinician._id], date, date);
  const slots = [...clinician.slotTimes].sort().map((time) => ({
    time,
    label: timeLabel(time),
    available: isFuture(date, time, now) && !taken.has(`${clinician._id}|${date}|${time}`),
  }));
  res.json({ date, slots });
});

export default router;
