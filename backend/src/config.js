import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().default(5000),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").optional(),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  ANTHROPIC_API_KEY: z.string().optional(),
  CHAT_MODEL: z.string().default("claude-haiku-4-5-20251001"),

  // "Feeling low for too long" thresholds. All tunable without touching code.
  GUIDANCE_GENTLE_LOW_DAYS: z.coerce.number().int().min(1).default(3),
  GUIDANCE_CONNECT_LOW_DAYS: z.coerce.number().int().min(1).default(5),
  GUIDANCE_URGENT_LOW_DAYS: z.coerce.number().int().min(1).default(10),
  GUIDANCE_PAST_RUN_LOOKBACK_DAYS: z.coerce.number().int().min(0).default(30),
  GUIDANCE_PHQ9_CONNECT: z.coerce.number().int().default(10),
  GUIDANCE_PHQ9_URGENT: z.coerce.number().int().default(20),
  GUIDANCE_GAD7_CONNECT: z.coerce.number().int().default(10),
  GUIDANCE_CRISIS_WINDOW_DAYS: z.coerce.number().int().default(7),
  GUIDANCE_SCREENING_WINDOW_DAYS: z.coerce.number().int().default(30),
});

// Treat `FOO=` lines in .env as unset.
const env = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ""));
const parsed = schema.parse(env);

const isProd = parsed.NODE_ENV === "production";
if (isProd && !parsed.JWT_SECRET) throw new Error("JWT_SECRET is required in production");
if (isProd && !parsed.MONGODB_URI) throw new Error("MONGODB_URI is required in production");

export const config = {
  env: parsed.NODE_ENV,
  isProd,
  isTest: parsed.NODE_ENV === "test",
  port: parsed.PORT,
  mongoUri: parsed.MONGODB_URI,
  jwtSecret: parsed.JWT_SECRET ?? "dev-only-secret-not-for-production",
  clientOrigin: parsed.CLIENT_ORIGIN,
  anthropicApiKey: parsed.ANTHROPIC_API_KEY,
  chatModel: parsed.CHAT_MODEL,
  guidance: {
    gentleLowDays: parsed.GUIDANCE_GENTLE_LOW_DAYS,
    connectLowDays: parsed.GUIDANCE_CONNECT_LOW_DAYS,
    urgentLowDays: parsed.GUIDANCE_URGENT_LOW_DAYS,
    pastRunLookbackDays: parsed.GUIDANCE_PAST_RUN_LOOKBACK_DAYS,
    phq9Connect: parsed.GUIDANCE_PHQ9_CONNECT,
    phq9Urgent: parsed.GUIDANCE_PHQ9_URGENT,
    gad7Connect: parsed.GUIDANCE_GAD7_CONNECT,
    crisisWindowDays: parsed.GUIDANCE_CRISIS_WINDOW_DAYS,
    screeningWindowDays: parsed.GUIDANCE_SCREENING_WINDOW_DAYS,
  },
};
