import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/index.js";
import { HttpError, clearSession, issueSession, requireAuth } from "../middleware/index.js";

const router = Router();

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  email: z.email("Enter a valid email").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1).max(128),
});

// Compared against when the email is unknown so login timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

router.post("/signup", async (req, res) => {
  const { firstName, email, password } = signupSchema.parse(req.body);
  if (await User.exists({ email: email.toLowerCase() })) {
    throw new HttpError(409, "An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ firstName, email, passwordHash });
  issueSession(res, user._id);
  res.status(201).json({ user: user.toPublic() });
});

router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Incorrect email or password");
  issueSession(res, user._id);
  res.json({ user: user.toPublic() });
});

router.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toPublic() });
});

export default router;
