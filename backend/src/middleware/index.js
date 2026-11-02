import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { config } from "../config.js";
import { User } from "../models/index.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const COOKIE_NAME = "mm_token";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProd,
  path: "/",
};

export function issueSession(res, userId) {
  const token = jwt.sign({ sub: userId.toString() }, config.jwtSecret, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: SEVEN_DAYS });
}

export function clearSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

export async function requireAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new HttpError(401, "Please log in to continue");
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new HttpError(401, "Your session has expired. Please log in again");
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, "Account not found");
  req.user = user;
  req.userId = user._id;
  next();
}

// Cheap CSRF defence on top of SameSite cookies: browsers always send Origin on cross-site writes.
export function checkOrigin(req, _res, next) {
  const safe = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  const origin = req.get("origin");
  if (!safe && origin && origin !== config.clientOrigin) {
    throw new HttpError(403, "Request origin not allowed");
  }
  next();
}

export function notFound(_req, _res, next) {
  next(new HttpError(404, "Not found"));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Invalid input",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (err instanceof mongoose.Error.CastError) return res.status(400).json({ error: "Invalid id" });
  if (err?.code === 11000) return res.status(409).json({ error: "That already exists" });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Malformed JSON" });
  if (err?.type === "entity.too.large") return res.status(413).json({ error: "Request too large" });

  if (!config.isTest) console.error("[error]", err);
  res.status(500).json({ error: "Something went wrong on our side" });
}

export function requestLogger(req, res, next) {
  if (config.isTest) return next();
  const start = Date.now();
  // Deliberately logs no bodies or query strings: they can contain private journal text.
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
}
