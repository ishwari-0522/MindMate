import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/index.js";
import { isoDate } from "../lib/dates.js";
import { getHelplines, guidanceForUser } from "../lib/support.js";

const router = Router();
router.use(requireAuth);

// Personalised from the person's own check-ins, screenings and chat. Nothing here is a fixed script.
router.get("/guidance", async (req, res) => {
  const { today } = z.object({ today: isoDate }).parse(req.query);
  res.json(await guidanceForUser(req.userId, today));
});

// For someone who asks for a helpline directly, regardless of what their data says.
router.get("/helplines", async (_req, res) => {
  res.json({ helplines: await getHelplines() });
});

export default router;
