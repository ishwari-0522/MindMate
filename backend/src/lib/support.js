import { config } from "../config.js";
import { ChatMessage, MoodEntry, Screening, SupportResource } from "../models/index.js";
import { addDays } from "./dates.js";
import { assessLevel, buildGuidance } from "./guidance.js";

const DAY_MS = 24 * 60 * 60 * 1000;
// Mood history loaded beyond the look-back window, so a run that began before it is still measured in full.
const RUN_HISTORY_DAYS = 60;

export const loadResources = () => SupportResource.find({ active: true }).sort({ kind: 1, order: 1 }).lean();

export async function getHelplines() {
  const rows = await SupportResource.find({ active: true, kind: { $in: ["emergency", "helpline"] } })
    .sort({ order: 1 })
    .lean();
  return rows.map((r) => ({
    id: r.key,
    kind: r.kind,
    title: r.title,
    description: r.description,
    phone: r.phone,
    hours: r.hours,
    languages: r.languages,
    url: r.url ?? null,
  }));
}

// The wording comes from the database, so changing a helpline there changes what the chat says.
export function crisisMessage(helplines) {
  const emergency = helplines.find((h) => h.kind === "emergency");
  const lines = helplines
    .filter((h) => h.kind === "helpline" && /24 hours/i.test(h.hours ?? ""))
    .slice(0, 3)
    .map((h) => `${h.title} ${h.phone}`);
  const urgent = emergency
    ? `If you might act on these thoughts or are in danger, please call ${emergency.phone} right now. `
    : "If you might act on these thoughts or are in danger, please call your local emergency number right now. ";
  const talk = lines.length ? `You can also talk to someone for free, any time: ${lines.join(", ")}. ` : "";
  return (
    "I'm really glad you told me, and I'm concerned about your safety. You deserve support from a real person right now. " +
    urgent +
    talk +
    "If you can, tell someone you trust that you're not okay. I'm still here with you."
  );
}

export async function guidanceForUser(userId, today) {
  const since = new Date(Date.now() - config.guidance.screeningWindowDays * DAY_MS);
  const crisisSince = new Date(Date.now() - config.guidance.crisisWindowDays * DAY_MS);

  const [moods, screenings, crisisCount, resources] = await Promise.all([
    MoodEntry.find({ userId, date: { $gte: addDays(today, -(config.guidance.pastRunLookbackDays + RUN_HISTORY_DAYS)), $lte: today } })
      .select("-_id date mood")
      .lean(),
    Screening.find({ userId, createdAt: { $gte: since } }).sort({ createdAt: -1 }).lean(),
    ChatMessage.countDocuments({ userId, role: "user", crisis: true, createdAt: { $gte: crisisSince } }),
    loadResources(),
  ]);

  const assessment = assessLevel({ moods, screenings, crisisCount, today }, config.guidance);
  return buildGuidance({ assessment, resources, today });
}
