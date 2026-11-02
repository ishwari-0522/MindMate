import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDb, disconnectDb } from "../src/db.js";
import { createApp } from "../src/app.js";
import { seedAll } from "../src/seed.js";

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDb(mongod.getUri("mindmate-support-test"));
  await seedAll();
  app = createApp();
}, 120000);

afterAll(async () => {
  await disconnectDb();
  await mongod.stop();
});

let counter = 0;
async function signedInAgent() {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/signup")
    .send({ firstName: "Test", email: `support${++counter}-${Date.now()}@example.com`, password: "correct-horse-battery" });
  expect(res.status).toBe(201);
  return { agent };
}

const today = new Date().toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};

async function agentWithLowDays(days, mood = "low") {
  const ctx = await signedInAgent();
  for (let i = 0; i < days; i++) {
    await ctx.agent.put(`/api/moods/${daysAgo(i)}`).send({ mood }).expect(200);
  }
  return ctx;
}

const guidance = async (agent) => (await agent.get(`/api/support/guidance?today=${today}`).expect(200)).body;

describe("support guidance (feeling low)", () => {
  it("offers nothing extra to someone who is doing fine", async () => {
    const { agent } = await signedInAgent();
    await agent.put(`/api/moods/${today}`).send({ mood: "great" });
    const g = await guidance(agent);
    expect(g.level).toBe(0);
    expect(g.platforms).toEqual([]);
    expect(g.helplines).toEqual([]);
  });

  it("level 1 after a few low days: ideas and places, but no professionals or numbers", async () => {
    const { agent } = await agentWithLowDays(3);
    const g = await guidance(agent);
    expect(g.level).toBe(1);
    expect(g.signals.lowStreak).toBe(3);
    expect(g.suggestions.activities.length).toBeGreaterThan(0);
    expect(g.suggestions.places.length).toBeGreaterThan(0);
    expect(g.suggestions.places[0].url).toMatch(/google\.com\/maps/);
    expect(g.platforms).toEqual([]);
    expect(g.helplines).toEqual([]);
  });

  it("level 2 when it goes on: websites to find professionals, still no phone numbers", async () => {
    const { agent } = await agentWithLowDays(5);
    const g = await guidance(agent);
    expect(g.level).toBe(2);
    expect(g.platforms.length).toBeGreaterThan(0);
    expect(g.platforms.every((p) => p.url.startsWith("https://") && p.phone === null)).toBe(true);
    expect(g.helplines).toEqual([]);
    expect(g.reasons.join(" ")).toMatch(/5 days in a row/);
  });

  it("level 3 when it is very prolonged: India-only helplines and 112", async () => {
    const { agent } = await agentWithLowDays(10, "rough");
    const g = await guidance(agent);
    expect(g.level).toBe(3);
    const phones = g.helplines.map((h) => h.phone);
    expect(phones).toContain("14416");
    expect(phones).toContain("112");
    expect(phones).not.toContain("988");
  });

  it("still notices a rough stretch that ended a few weeks ago (level 2, no helplines)", async () => {
    const { agent } = await signedInAgent();
    for (let i = 20; i < 32; i++) await agent.put(`/api/moods/${daysAgo(i)}`).send({ mood: "low" }).expect(200);
    const g = await guidance(agent);
    expect(g.level).toBe(2);
    expect(g.signals.lowStreak).toBe(0);
    expect(g.signals.pastRun.length).toBe(12);
    expect(g.platforms.length).toBeGreaterThan(0);
    expect(g.helplines).toEqual([]);
    expect(g.reasons[0]).toMatch(/12 days in a row \(\d+ \w+ to \d+ \w+\)/);

    await agent.put(`/api/moods/${today}`).send({ mood: "great" }).expect(200);
    expect((await guidance(agent)).level).toBe(0);
  });

  it("a good day today resets the low streak", async () => {
    const { agent } = await agentWithLowDays(5);
    await agent.put(`/api/moods/${today}`).send({ mood: "good" });
    expect((await guidance(agent)).level).toBe(0);
  });

  it("raises to level 3 after a crisis message in chat", async () => {
    const { agent } = await signedInAgent();
    await agent.post("/api/chat").send({ text: "I want to die" }).expect(201);
    const g = await guidance(agent);
    expect(g.level).toBe(3);
    expect(g.reasons.join(" ")).toMatch(/chat/i);
  });

  it("screening results carry support that matches the score", async () => {
    const { agent } = await signedInAgent();
    const minimal = await agent
      .post("/api/screenings")
      .send({ type: "phq9", answers: [0, 0, 0, 0, 0, 0, 0, 0, 0], today })
      .expect(201);
    expect(minimal.body.support.level).toBe(0);
    expect(minimal.body.support.helplines).toEqual([]);

    const moderate = await agent
      .post("/api/screenings")
      .send({ type: "phq9", answers: [2, 2, 2, 2, 2, 0, 0, 0, 0], today })
      .expect(201);
    expect(moderate.body.support.level).toBe(2);
    expect(moderate.body.support.platforms.length).toBeGreaterThan(0);
    expect(moderate.body.support.helplines).toEqual([]);

    const severe = await agent
      .post("/api/screenings")
      .send({ type: "phq9", answers: [3, 3, 3, 3, 3, 3, 3, 3, 3], today })
      .expect(201);
    expect(severe.body.support.level).toBe(3);
    expect(severe.body.support.helplines.map((h) => h.phone)).toContain("14416");
  });

  it("lets someone ask for helplines directly, and validates the date", async () => {
    const { agent } = await signedInAgent();
    const res = await agent.get("/api/support/helplines").expect(200);
    expect(res.body.helplines.map((h) => h.phone)).toEqual(
      expect.arrayContaining(["112", "14416", "1800-599-0019"])
    );
    await agent.get("/api/support/guidance").expect(400);
  });
});

describe("coping exercises", () => {
  it("serves guided exercises with steps and timed phases", async () => {
    const { agent } = await signedInAgent();
    const { exercises } = (await agent.get("/api/coping/exercises").expect(200)).body;
    const box = exercises.find((e) => e.id === "box-breathing");
    expect(box.steps.length).toBeGreaterThanOrEqual(4);
    expect(box.phases.map((p) => p.label)).toEqual(["Breathe in", "Hold", "Breathe out", "Hold"]);
    expect(box.totalSeconds).toBe(16 * box.rounds);
    expect(exercises.some((e) => e.featured)).toBe(true);
    expect(exercises.every((e) => e.phases.length > 0 && e.minutes >= 1)).toBe(true);
  });
});

describe("journal on the calendar and weekend patterns", () => {
  it("filters journal entries by date range", async () => {
    const { agent } = await signedInAgent();
    const body = { period: "Morning entry", mood: "good", tags: [] };
    await agent.post("/api/journal").send({ ...body, date: daysAgo(40), text: "old" }).expect(201);
    await agent.post("/api/journal").send({ ...body, date: today, text: "new" }).expect(201);
    const recent = await agent.get(`/api/journal?from=${daysAgo(10)}&to=${today}`).expect(200);
    expect(recent.body.entries.map((e) => e.text)).toEqual(["new"]);
    expect((await agent.get("/api/journal?limit=200")).body.entries).toHaveLength(2);
  });

  it("reports weekday vs weekend averages and variability", async () => {
    const { agent } = await signedInAgent();
    const before = (await agent.get(`/api/trends?range=week&today=${today}`)).body.patterns;
    expect(before.difference).toBeNull();
    expect(before.variability).toBeNull();

    for (let i = 0; i < 28; i++) {
      const dow = new Date(`${daysAgo(i)}T00:00:00Z`).getUTCDay();
      const weekend = dow === 0 || dow === 6;
      await agent.put(`/api/moods/${daysAgo(i)}`).send({ mood: weekend ? "great" : "okay" }).expect(200);
    }
    const { patterns } = (await agent.get(`/api/trends?range=month&today=${today}`)).body;
    expect(patterns.weekend.avg).toBe(5);
    expect(patterns.weekday.avg).toBe(3);
    expect(patterns.difference).toBe(2);
    expect(patterns.variability.label).toBeDefined();
  });
});

describe("stepping back through weeks", () => {
  const mondayOf = (iso) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  };

  it("shows another week's bars, dates and averages", async () => {
    const { agent } = await signedInAgent();
    const lastWeekDay = daysAgo(7); // always inside last week
    const monday = mondayOf(lastWeekDay);
    const plusDays = (iso, n) => {
      const d = new Date(`${iso}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + n);
      return d.toISOString().slice(0, 10);
    };
    await agent.put(`/api/moods/${monday}`).send({ mood: "great" }).expect(200);
    await agent.put(`/api/moods/${plusDays(monday, 2)}`).send({ mood: "low" }).expect(200);

    const res = await agent.get(`/api/trends?range=week&today=${today}&weekOf=${lastWeekDay}`).expect(200);
    expect(res.body.week).toEqual({ start: monday, end: plusDays(monday, 6) });
    expect(res.body.bars.map((b) => b.value)).toEqual([5, 0, 2, 0, 0, 0, 0]);
    expect(res.body.loggedDays).toBe(2);
    expect(res.body.avgMood).toBe(3.5);

    // this week is unaffected by what happened last week
    const thisWeek = await agent.get(`/api/trends?range=week&today=${today}`).expect(200);
    expect(thisWeek.body.week.start).toBe(mondayOf(today));
    expect(thisWeek.body.bars.map((b) => b.value).every((v) => v === 0)).toBe(true);
  });

  it("refuses to look at a week that hasn't happened", async () => {
    const { agent } = await signedInAgent();
    await agent.get(`/api/trends?range=week&today=${today}&weekOf=${daysAgo(-7)}`).expect(400);
  });
});
