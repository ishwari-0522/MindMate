import { pathToFileURL } from "node:url";
import { Clinician, CopingExercise, SupportResource } from "./models/index.js";
import { SUPPORT_RESOURCES } from "./data/supportResources.js";
import { COPING_EXERCISES } from "./data/copingExercises.js";

const CLINICIANS = [
  {
    name: "Dr. Ananya Deshmukh",
    city: "Mumbai",
    specialty: "Anxiety & Somatic Trauma",
    tags: ["Anxiety", "Stress"],
    rating: 4.9,
    reviewCount: "1.2k",
    initials: "A",
    color: "var(--accent-blue)",
    slotTimes: ["09:00", "10:30", "13:00", "15:30"],
  },
  {
    name: "Dr. Rohan Kulkarni",
    city: "Mumbai",
    specialty: "Mindfulness & Stress Management",
    tags: ["Stress", "Depression"],
    rating: 4.8,
    reviewCount: "940",
    initials: "R",
    color: "var(--accent-peach)",
    slotTimes: ["09:00", "10:30", "13:00", "15:30"],
  },
  {
    name: "Dr. Priya Nair",
    city: "Mumbai",
    specialty: "Grief & Life Transitions",
    tags: ["Grief", "Depression"],
    rating: 4.9,
    reviewCount: "760",
    initials: "P",
    color: "var(--mood-low-bg)",
    slotTimes: ["09:00", "10:30", "13:00", "15:30"],
  },
  {
    name: "Dr. Imran Shaikh",
    city: "Mumbai",
    specialty: "Panic & Generalized Anxiety",
    tags: ["Anxiety"],
    rating: 4.7,
    reviewCount: "510",
    initials: "I",
    color: "var(--mood-great-bg)",
    slotTimes: ["10:30", "13:00", "15:30", "17:00"],
  },
];

// Idempotent: safe to run on every start. The list above is the source of truth, so anyone no longer in it is removed.
export async function seedClinicians() {
  for (const c of CLINICIANS) {
    await Clinician.updateOne({ name: c.name }, { $set: c }, { upsert: true });
  }
  await Clinician.deleteMany({ name: { $nin: CLINICIANS.map((c) => c.name) } });
}

// Support resources and coping exercises are admin-managed content, so the data files are the source of truth:
// entries are upserted and any key no longer in the file is removed.
async function syncContent(Model, items) {
  for (const item of items) {
    await Model.updateOne({ key: item.key }, { $set: { active: true, ...item } }, { upsert: true });
  }
  await Model.deleteMany({ key: { $nin: items.map((i) => i.key) } });
}

export async function seedSupportResources() {
  await syncContent(SupportResource, SUPPORT_RESOURCES);
}

export async function seedCopingExercises() {
  await syncContent(CopingExercise, COPING_EXERCISES);
}

export async function seedAll() {
  await seedClinicians();
  await seedSupportResources();
  await seedCopingExercises();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { connectDb, disconnectDb } = await import("./db.js");
  await connectDb();
  await seedAll();
  console.log(
    `Seeded ${CLINICIANS.length} clinicians, ${SUPPORT_RESOURCES.length} support resources, ${COPING_EXERCISES.length} coping exercises`
  );
  await disconnectDb();
}
