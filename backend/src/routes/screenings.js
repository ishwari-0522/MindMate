import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/index.js";
import { Screening } from "../models/index.js";
import { INSTRUMENTS, scoreScreening } from "../lib/scoring.js";
import { isoDate } from "../lib/dates.js";
import { guidanceForUser } from "../lib/support.js";

const router = Router();
router.use(requireAuth);

const toDto = (s) => ({
  id: s._id.toString(),
  type: s.type,
  score: s.score,
  max: s.max,
  severity: s.severity,
  selfHarmFlag: s.selfHarmFlag,
  createdAt: s.createdAt,
});

router.get("/", async (req, res) => {
  const screenings = await Screening.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
  res.json({ screenings: screenings.map(toDto) });
});

router.post("/", async (req, res) => {
  const { type, answers, today } = z
    .object({
      type: z.enum(["phq9", "gad7"]),
      answers: z.array(z.number().int().min(0).max(3)),
      today: isoDate.optional(),
    })
    .parse(req.body);

  if (answers.length !== INSTRUMENTS[type].items) {
    return res.status(400).json({ error: `${INSTRUMENTS[type].label} needs ${INSTRUMENTS[type].items} answers` });
  }

  // The score is always recomputed here; the client's own arithmetic is never trusted.
  const result = scoreScreening(type, answers);
  const screening = await Screening.create({
    userId: req.userId,
    type: result.label,
    answers,
    score: result.score,
    max: result.max,
    severity: result.severity,
    selfHarmFlag: result.selfHarmFlag,
  });

  // The result screen shows only what this score calls for: websites to find a professional at level 2,
  // helplines at level 3. Computed from this person's data, not fixed per score.
  const guidance = await guidanceForUser(req.userId, today ?? new Date().toISOString().slice(0, 10));
  res.status(201).json({
    screening: toDto(screening),
    support: {
      level: guidance.level,
      headline: guidance.headline,
      message: guidance.message,
      platforms: guidance.platforms,
      helplines: guidance.helplines,
    },
  });
});

export default router;
