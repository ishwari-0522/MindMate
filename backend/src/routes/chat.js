import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { requireAuth } from "../middleware/index.js";
import { ChatMessage } from "../models/index.js";
import { generateReply, isCrisis } from "../lib/chatReply.js";
import { crisisMessage, getHelplines } from "../lib/support.js";

const router = Router();
router.use(requireAuth);

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.isTest ? 1000 : 20,
  keyGenerator: (req) => req.userId.toString(),
  validate: { keyGeneratorIpFallback: false },
  message: { error: "You're sending messages quickly. Take a breath and try again in a minute." },
});

const toDto = (m) => ({ id: m._id.toString(), from: m.role, text: m.text, crisis: m.crisis, createdAt: m.createdAt });

router.get("/", async (req, res) => {
  let messages = await ChatMessage.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(100);
  messages = messages.reverse();
  if (messages.length === 0) {
    const greeting = await ChatMessage.create({
      userId: req.userId,
      role: "bot",
      text: `Hello ${req.user.firstName}. I'm here in your safe space. Whatever is on your mind, we can sort through it gently, without judgment. How is your energy right now?`,
    });
    messages = [greeting];
  }
  res.json({ messages: messages.map(toDto) });
});

router.post("/", chatLimiter, async (req, res) => {
  const { text } = z.object({ text: z.string().trim().min(1).max(2000) }).parse(req.body);

  const recent = await ChatMessage.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
  const history = recent.reverse().map((m) => ({ role: m.role, text: m.text }));

  const crisis = isCrisis(text);
  const userMessage = await ChatMessage.create({ userId: req.userId, role: "user", text, crisis });
  const replyText = crisis
    ? crisisMessage(await getHelplines())
    : await generateReply({ history, text, firstName: req.user.firstName, config });
  const botMessage = await ChatMessage.create({ userId: req.userId, role: "bot", text: replyText, crisis });

  res.status(201).json({ messages: [toDto(userMessage), toDto(botMessage)], crisis });
});

export default router;
