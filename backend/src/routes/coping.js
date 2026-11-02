import { Router } from "express";
import { requireAuth } from "../middleware/index.js";
import { CopingExercise } from "../models/index.js";

const router = Router();
router.use(requireAuth);

router.get("/exercises", async (_req, res) => {
  const rows = await CopingExercise.find({ active: true }).sort({ order: 1 }).lean();
  res.json({
    exercises: rows.map((e) => {
      const totalSeconds = e.phases.reduce((sum, p) => sum + p.seconds, 0) * e.rounds;
      return {
        id: e.key,
        title: e.title,
        summary: e.summary,
        accent: e.accent,
        featured: e.featured,
        tag: e.tag ?? null,
        intro: e.intro,
        steps: e.steps,
        caution: e.caution ?? null,
        closing: e.closing,
        rounds: e.rounds,
        phases: e.phases,
        totalSeconds,
        minutes: Math.max(1, Math.round(totalSeconds / 60)),
      };
    }),
  });
});

export default router;
