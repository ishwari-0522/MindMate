import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { checkOrigin, errorHandler, notFound, requestLogger } from "./middleware/index.js";
import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";
import moodRoutes from "./routes/moods.js";
import journalRoutes from "./routes/journal.js";
import screeningRoutes from "./routes/screenings.js";
import trendRoutes from "./routes/trends.js";
import chatRoutes from "./routes/chat.js";
import clinicianRoutes from "./routes/clinicians.js";
import bookingRoutes from "./routes/bookings.js";
import supportRoutes from "./routes/support.js";
import copingRoutes from "./routes/coping.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json({ limit: "50kb" }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(checkOrigin);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.isTest ? 1000 : 30,
    message: { error: "Too many attempts. Please wait a few minutes and try again." },
  });

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/signup", authLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/moods", moodRoutes);
  app.use("/api/journal", journalRoutes);
  app.use("/api/screenings", screeningRoutes);
  app.use("/api/trends", trendRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/clinicians", clinicianRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/support", supportRoutes);
  app.use("/api/coping", copingRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
