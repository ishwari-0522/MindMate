import { Router } from "express";
import { z } from "zod";
import { HttpError, requireAuth } from "../middleware/index.js";
import { Booking, Clinician } from "../models/index.js";
import { addDays, isoDate, localDateTime, resolveNow, timeLabel } from "../lib/dates.js";

const router = Router();
router.use(requireAuth);

const bookSchema = z.object({
  clinicianId: z.string().length(24, "Invalid clinician"),
  date: isoDate,
  time: z.string().regex(/^\d{2}:\d{2}$/),
  category: z.enum(["Anxiety", "Depression", "Stress", "Grief"]),
  now: localDateTime.optional(),
});

const toDto = (b, clinician) => ({
  id: b._id.toString(),
  clinicianId: b.clinicianId.toString(),
  clinicianName: clinician?.name ?? "Clinician",
  date: b.date,
  time: b.time,
  label: timeLabel(b.time),
  category: b.category,
  status: b.status,
});

router.get("/", async (req, res) => {
  const bookings = await Booking.find({ userId: req.userId, status: "confirmed" })
    .sort({ date: 1, time: 1 })
    .limit(50);
  const clinicians = await Clinician.find({ _id: { $in: bookings.map((b) => b.clinicianId) } }).select("name").lean();
  const nameById = new Map(clinicians.map((c) => [c._id.toString(), c]));
  res.json({ bookings: bookings.map((b) => toDto(b, nameById.get(b.clinicianId.toString()))) });
});

router.post("/", async (req, res) => {
  const { clinicianId, date, time, category, now: nowParam } = bookSchema.parse(req.body);
  const now = resolveNow(nowParam);

  const clinician = await Clinician.findById(clinicianId).lean();
  if (!clinician) throw new HttpError(404, "Clinician not found");
  if (!clinician.slotTimes.includes(time)) throw new HttpError(400, "That time isn't offered");
  if (!clinician.tags.includes(category)) throw new HttpError(400, `${clinician.name} doesn't list ${category}`);
  if (date < now.today || (date === now.today && time <= now.time)) throw new HttpError(400, "That time has passed");
  if (date > addDays(now.today, 60)) throw new HttpError(400, "Bookings open up to 60 days ahead");

  try {
    const booking = await Booking.create({ userId: req.userId, clinicianId, date, time, category });
    res.status(201).json({ booking: toDto(booking, clinician) });
  } catch (err) {
    // The partial unique index is what makes this safe under concurrent requests.
    if (err?.code === 11000) throw new HttpError(409, "That slot was just taken. Please pick another time");
    throw err;
  }
});

router.delete("/:id", async (req, res) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId, status: "confirmed" },
    { status: "cancelled" },
    { returnDocument: "after" }
  );
  if (!booking) throw new HttpError(404, "Booking not found");
  res.json({ ok: true });
});

export default router;
