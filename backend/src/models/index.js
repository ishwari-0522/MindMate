import mongoose from "mongoose";
import { MOODS } from "../lib/scoring.js";

const { Schema } = mongoose;
const ref = (model) => ({ type: Schema.Types.ObjectId, ref: model, required: true, index: true });

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    notifications: {
      dailyCheckin: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: false },
      aiTips: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  const initials = this.firstName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: this._id.toString(),
    firstName: this.firstName,
    email: this.email,
    initials: initials || "U",
    notifications: this.notifications,
  };
};

const moodEntrySchema = new Schema(
  {
    userId: ref("User"),
    date: { type: String, required: true },
    mood: { type: String, enum: MOODS, required: true },
  },
  { timestamps: true }
);
moodEntrySchema.index({ userId: 1, date: 1 }, { unique: true });

const journalEntrySchema = new Schema(
  {
    userId: ref("User"),
    date: { type: String, required: true },
    period: { type: String, enum: ["Morning entry", "Afternoon entry", "Evening entry"], required: true },
    mood: { type: String, enum: MOODS, required: true },
    text: { type: String, default: "", trim: true, maxlength: 5000 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);
journalEntrySchema.index({ userId: 1, date: -1, createdAt: -1 });

const screeningSchema = new Schema(
  {
    userId: ref("User"),
    type: { type: String, enum: ["PHQ-9", "GAD-7"], required: true },
    answers: { type: [Number], required: true },
    score: { type: Number, required: true },
    max: { type: Number, required: true },
    severity: { type: String, required: true },
    selfHarmFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);
screeningSchema.index({ userId: 1, createdAt: -1 });

const chatMessageSchema = new Schema(
  {
    userId: ref("User"),
    role: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true, maxlength: 4000 },
    crisis: { type: Boolean, default: false },
  },
  { timestamps: true }
);
chatMessageSchema.index({ userId: 1, createdAt: 1 });

const clinicianSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    city: { type: String, default: "Mumbai" },
    specialty: { type: String, required: true },
    tags: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    reviewCount: { type: String, default: "0" },
    initials: { type: String, required: true },
    color: { type: String, default: "var(--accent-blue)" },
    slotTimes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const bookingSchema = new Schema(
  {
    userId: ref("User"),
    clinicianId: ref("Clinician"),
    date: { type: String, required: true },
    time: { type: String, required: true },
    category: { type: String, enum: ["Anxiety", "Depression", "Stress", "Grief"], required: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true }
);
// A slot can only be held by one confirmed booking; cancelling frees it.
bookingSchema.index(
  { clinicianId: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

// Admin-managed content (not user data). Seeded from src/data/* and editable in the database.
const supportResourceSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["activity", "place", "advice", "platform", "helpline", "emergency"], required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String },
    phone: { type: String },
    hours: { type: String },
    languages: { type: [String], default: [] },
    mapsQuery: { type: String },
    region: { type: String, default: "IN" },
    minLevel: { type: Number, min: 0, max: 3, default: 1 },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    verifiedOn: { type: String },
    source: { type: String },
  },
  { timestamps: true }
);
supportResourceSchema.index({ kind: 1, active: 1, order: 1 });

const copingExerciseSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    accent: { type: String, enum: ["blue", "peach", "green", "purple"], default: "blue" },
    featured: { type: Boolean, default: false },
    tag: { type: String },
    intro: { type: String, required: true },
    steps: { type: [String], default: [] },
    caution: { type: String },
    closing: { type: String, default: "Well done. Notice how your body feels now." },
    rounds: { type: Number, default: 1, min: 1 },
    phases: [
      {
        _id: false,
        label: { type: String, required: true },
        instruction: { type: String, default: "" },
        seconds: { type: Number, required: true, min: 1 },
        motion: { type: String, enum: ["grow", "shrink", "hold", "none"], default: "none" },
      },
    ],
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SupportResource = mongoose.model("SupportResource", supportResourceSchema);
export const CopingExercise = mongoose.model("CopingExercise", copingExerciseSchema);
export const User = mongoose.model("User", userSchema);
export const MoodEntry = mongoose.model("MoodEntry", moodEntrySchema);
export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
export const Screening = mongoose.model("Screening", screeningSchema);
export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export const Clinician = mongoose.model("Clinician", clinicianSchema);
export const Booking = mongoose.model("Booking", bookingSchema);
