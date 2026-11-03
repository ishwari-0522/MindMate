import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDb, disconnectDb } from "../src/db.js";
import { createApp } from "../src/app.js";
import { seedAll } from "../src/seed.js";
import { Clinician } from "../src/models/index.js";

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri("mindmate-test"));
  await seedAll();
  app = createApp();
}, 120000);

afterAll(async () => {
  await disconnectDb();
  await mongod.stop();
});

const PASSWORD = "correct-horse-battery";
let counter = 0;

async function signedInAgent(firstName = "Asavari") {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/signup")
    .send({ firstName, email: `user${++counter}-${Date.now()}@example.com`, password: PASSWORD });
  expect(res.status).toBe(201);
  return { agent, user: res.body.user };
}

const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

describe("auth", () => {
  it("signs up, returns the session user, and sets an httpOnly cookie", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ firstName: "Asavari Sharma", email: "Auth@Example.com", password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ firstName: "Asavari Sharma", email: "auth@example.com", initials: "AS" });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/i);
  });

  it("requires an email to sign up", async () => {
    const res = await request(app).post("/api/auth/signup").send({ firstName: "No Email", password: PASSWORD });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate emails, weak passwords and bad logins", async () => {
    const dup = await request(app)
      .post("/api/auth/signup")
      .send({ firstName: "Again", email: "auth@example.com", password: PASSWORD });
    expect(dup.status).toBe(409);

    const weak = await request(app).post("/api/auth/signup").send({ firstName: "X", email: "weak@example.com", password: "short" });
    expect(weak.status).toBe(400);

    const bad = await request(app).post("/api/auth/login").send({ email: "auth@example.com", password: "wrong-password" });
    expect(bad.status).toBe(401);
    const unknown = await request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: PASSWORD });
    expect(unknown.status).toBe(401);
    expect(unknown.body.error).toBe(bad.body.error);
  });

  it("logs in, reads /me, and logs out", async () => {
    const agent = request.agent(app);
    expect((await agent.post("/api/auth/login").send({ email: "auth@example.com", password: PASSWORD })).status).toBe(200);
    expect((await agent.get("/api/auth/me")).body.user.email).toBe("auth@example.com");
    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });

  it("requires login for data routes", async () => {
    for (const path of ["/api/moods", "/api/journal", "/api/screenings", "/api/chat", "/api/bookings"]) {
      expect((await request(app).get(path)).status).toBe(401);
    }
  });

  it("rejects writes from a foreign origin", async () => {
    const { agent } = await signedInAgent();
    const res = await agent.put(`/api/moods/${today}`).set("Origin", "http://evil.example").send({ mood: "good" });
    expect(res.status).toBe(403);
  });
});

describe("moods and journal", () => {
  it("upserts one mood per day and filters by range", async () => {
    const { agent } = await signedInAgent();
    await agent.put(`/api/moods/${today}`).send({ mood: "good" }).expect(200);
    await agent.put(`/api/moods/${today}`).send({ mood: "great" }).expect(200);
    await agent.put(`/api/moods/${daysAgo(5)}`).send({ mood: "low" }).expect(200);

    const all = await agent.get("/api/moods").expect(200);
    expect(all.body.moods).toHaveLength(2);
    expect(all.body.moods.find((m) => m.date === today).mood).toBe("great");

    const recent = await agent.get(`/api/moods?from=${daysAgo(2)}&to=${today}`).expect(200);
    expect(recent.body.moods).toHaveLength(1);
  });

  it("rejects invalid moods and far-future dates", async () => {
    const { agent } = await signedInAgent();
    await agent.put(`/api/moods/${today}`).send({ mood: "ecstatic" }).expect(400);
    await agent.put("/api/moods/2999-01-01").send({ mood: "good" }).expect(400);
    await agent.put("/api/moods/not-a-date").send({ mood: "good" }).expect(400);
  });

  it("creates, edits and deletes journal entries, and keeps them private", async () => {
    const a = await signedInAgent("A");
    const b = await signedInAgent("B");
    const payload = { date: today, period: "Evening entry", mood: "good", text: "A private thought", tags: ["Work"] };

    const created = await a.agent.post("/api/journal").send(payload).expect(201);
    const id = created.body.entry.id;

    await a.agent.put(`/api/journal/${id}`).send({ ...payload, text: "Edited thought" }).expect(200);
    expect((await a.agent.get("/api/journal")).body.entries[0].text).toBe("Edited thought");

    expect((await b.agent.get("/api/journal")).body.entries).toHaveLength(0);
    await b.agent.put(`/api/journal/${id}`).send(payload).expect(404);
    await b.agent.delete(`/api/journal/${id}`).expect(404);

    await a.agent.delete(`/api/journal/${id}`).expect(200);
    expect((await a.agent.get("/api/journal")).body.entries).toHaveLength(0);
  });

  it("validates journal input", async () => {
    const { agent } = await signedInAgent();
    const base = { date: today, period: "Evening entry", mood: "good", tags: ["Fun"] };

    // writing is optional: blank text, or no text at all, is a valid entry
    const blank = await agent.post("/api/journal").send({ ...base, text: "   " }).expect(201);
    expect(blank.body.entry).toMatchObject({ text: "", tags: ["Fun"] });
    const omitted = await agent.post("/api/journal").send(base).expect(201);
    expect(omitted.body.entry.text).toBe("");

    await agent.post("/api/journal").send({ ...base, text: "a".repeat(5001) }).expect(400);
    await agent.post("/api/journal").send({ ...base, mood: "ecstatic" }).expect(400);
    await agent.delete("/api/journal/not-an-object-id").expect(400);
  });
});

describe("screenings", () => {
  it("scores PHQ-9 on the server and flags item 9", async () => {
    const { agent } = await signedInAgent();
    const calm = await agent.post("/api/screenings").send({ type: "phq9", answers: [1, 1, 1, 1, 1, 1, 1, 1, 0] }).expect(201);
    expect(calm.body.screening).toMatchObject({ type: "PHQ-9", score: 8, max: 27, severity: "Mild", selfHarmFlag: false });

    const flagged = await agent.post("/api/screenings").send({ type: "phq9", answers: [0, 0, 0, 0, 0, 0, 0, 0, 1] }).expect(201);
    expect(flagged.body.screening).toMatchObject({ score: 1, severity: "Minimal", selfHarmFlag: true });

    const gad = await agent.post("/api/screenings").send({ type: "gad7", answers: [3, 3, 3, 3, 3, 3, 3] }).expect(201);
    expect(gad.body.screening).toMatchObject({ type: "GAD-7", score: 21, severity: "Severe" });

    const list = await agent.get("/api/screenings").expect(200);
    expect(list.body.screenings).toHaveLength(3);
  });

  it("rejects wrong answer counts and out-of-range answers", async () => {
    const { agent } = await signedInAgent();
    await agent.post("/api/screenings").send({ type: "phq9", answers: [1, 1] }).expect(400);
    await agent.post("/api/screenings").send({ type: "gad7", answers: [0, 0, 0, 0, 0, 0, 9] }).expect(400);
    await agent.post("/api/screenings").send({ type: "mmpi", answers: [] }).expect(400);
  });
});

describe("trends", () => {
  it("computes streak, bars, average and top trigger", async () => {
    const { agent } = await signedInAgent();
    for (const [offset, mood] of [[0, "great"], [1, "good"], [2, "good"], [4, "rough"]]) {
      await agent.put(`/api/moods/${daysAgo(offset)}`).send({ mood }).expect(200);
    }
    for (const tags of [["Work", "Sleep"], ["Work"]]) {
      await agent.post("/api/journal").send({ date: today, period: "Morning entry", mood: "good", text: "x", tags }).expect(201);
    }

    const week = await agent.get(`/api/trends?range=week&today=${today}`).expect(200);
    expect(week.body.streak).toBe(3);
    expect(week.body.bars).toHaveLength(7);
    expect(week.body.loggedDays).toBe(4);
    expect(week.body.avgMood).toBe(3.5);
    expect(week.body.topTrigger).toBe("Work");

    const month = await agent.get(`/api/trends?range=month&today=${today}`).expect(200);
    expect(month.body.bars.map((b) => b.label)).toEqual(["Wk 1", "Wk 2", "Wk 3", "Wk 4"]);
    const year = await agent.get(`/api/trends?range=year&today=${today}`).expect(200);
    expect(year.body.bars).toHaveLength(12);
  });

  it("returns empty-state values for a brand new user", async () => {
    const { agent } = await signedInAgent();
    const res = await agent.get(`/api/trends?range=week&today=${today}`).expect(200);
    expect(res.body).toMatchObject({ avgMood: null, streak: 0, topTrigger: null, changePct: null, loggedDays: 0 });
    await agent.get("/api/trends?range=week").expect(400);
  });
});

describe("chat", () => {
  it("greets by name, replies, and persists history", async () => {
    const { agent } = await signedInAgent("Meera");
    const first = await agent.get("/api/chat").expect(200);
    expect(first.body.messages).toHaveLength(1);
    expect(first.body.messages[0].text).toContain("Meera");

    const sent = await agent.post("/api/chat").send({ text: "I feel overwhelmed by work" }).expect(201);
    expect(sent.body.messages.map((m) => m.from)).toEqual(["user", "bot"]);
    expect(sent.body.crisis).toBe(false);

    expect((await agent.get("/api/chat")).body.messages).toHaveLength(3);
  });

  it("answers self-harm language with crisis resources instead of the AI", async () => {
    const { agent } = await signedInAgent();
    const res = await agent.post("/api/chat").send({ text: "I want to end my life" }).expect(201);
    expect(res.body.crisis).toBe(true);
    expect(res.body.messages[1].text).toMatch(/14416/);
    expect(res.body.messages[1].text).toMatch(/112/);
    expect(res.body.messages[1].text).not.toMatch(/988/);
  });

  it("rejects empty and oversized messages", async () => {
    const { agent } = await signedInAgent();
    await agent.post("/api/chat").send({ text: "  " }).expect(400);
    await agent.post("/api/chat").send({ text: "a".repeat(2001) }).expect(400);
  });
});

describe("clinicians and bookings", () => {
  const futureDay = daysAgo(-3);
  const now = `${today}T08:00`;

  it("filters clinicians by category and reports the next slot", async () => {
    const { agent } = await signedInAgent();
    const res = await agent.get(`/api/clinicians?category=Grief&now=${now}`).expect(200);
    expect(res.body.clinicians.map((c) => c.name)).toEqual(["Dr. Priya Nair"]);
    expect(res.body.clinicians[0].nextSlot.label).toBe("Today, 9:00 AM");
  });

  it("books a slot, blocks double-booking, and frees the slot on cancel", async () => {
    const a = await signedInAgent();
    const b = await signedInAgent();
    const clinician = await Clinician.findOne({ name: "Dr. Ananya Deshmukh" });
    const body = { clinicianId: clinician.id, date: futureDay, time: "13:00", category: "Anxiety", now };

    const booked = await a.agent.post("/api/bookings").send(body).expect(201);
    expect(booked.body.booking).toMatchObject({ clinicianName: "Dr. Ananya Deshmukh", label: "1:00 PM" });

    await b.agent.post("/api/bookings").send(body).expect(409);

    const slots = await b.agent.get(`/api/clinicians/${clinician.id}/slots?date=${futureDay}&now=${now}`).expect(200);
    expect(slots.body.slots.find((s) => s.time === "13:00").available).toBe(false);
    expect(slots.body.slots.find((s) => s.time === "09:00").available).toBe(true);

    expect((await a.agent.get("/api/bookings")).body.bookings).toHaveLength(1);
    await b.agent.delete(`/api/bookings/${booked.body.booking.id}`).expect(404);
    await a.agent.delete(`/api/bookings/${booked.body.booking.id}`).expect(200);
    await b.agent.post("/api/bookings").send(body).expect(201);
  });

  it("rejects past times, unknown times and mismatched categories", async () => {
    const { agent } = await signedInAgent();
    const clinician = await Clinician.findOne({ name: "Dr. Ananya Deshmukh" });
    const base = { clinicianId: clinician.id, date: futureDay, time: "09:00", category: "Anxiety", now };
    await agent.post("/api/bookings").send({ ...base, date: daysAgo(1) }).expect(400);
    await agent.post("/api/bookings").send({ ...base, now: `${futureDay}T10:00` }).expect(400);
    await agent.post("/api/bookings").send({ ...base, time: "03:17" }).expect(400);
    await agent.post("/api/bookings").send({ ...base, category: "Grief" }).expect(400);
  });
});

describe("account", () => {
  it("updates notification settings", async () => {
    const { agent } = await signedInAgent();
    const res = await agent.patch("/api/me").send({ notifications: { weeklySummary: true } }).expect(200);
    expect(res.body.user.notifications).toEqual({ dailyCheckin: true, weeklySummary: true, aiTips: true });
    await agent.patch("/api/me").send({ email: "hijack@example.com" }).expect(400);
  });

  it("exports everything, then deletes the account and all its data", async () => {
    const { agent, user } = await signedInAgent();
    await agent.put(`/api/moods/${today}`).send({ mood: "good" });
    await agent.post("/api/journal").send({ date: today, period: "Morning entry", mood: "good", text: "hello", tags: [] });
    await agent.post("/api/screenings").send({ type: "gad7", answers: [0, 0, 0, 0, 0, 0, 0] });

    const exported = await agent.get("/api/me/export").expect(200);
    expect(exported.headers["content-disposition"]).toMatch(/attachment/);
    expect(exported.body).toMatchObject({ profile: { id: user.id } });
    expect(exported.body.moods).toHaveLength(1);
    expect(exported.body.journal).toHaveLength(1);
    expect(exported.body.screenings).toHaveLength(1);
    expect(JSON.stringify(exported.body)).not.toMatch(/passwordHash/);

    await agent.delete("/api/me").expect(200);
    expect((await agent.get("/api/auth/me")).status).toBe(401);
    const relogin = await request(app).post("/api/auth/login").send({ email: user.email, password: PASSWORD });
    expect(relogin.status).toBe(401);
  });
});
