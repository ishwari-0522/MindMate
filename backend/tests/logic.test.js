import { describe, expect, it } from "vitest";
import { assessLevel, lowStreak, pickRotating } from "../src/lib/guidance.js";
import { weekdayWeekendPatterns } from "../src/lib/patterns.js";
import { crisisMessage } from "../src/lib/support.js";
import { classify, fallbackReply, isCrisis } from "../src/lib/chatReply.js";
import { DEFAULT_REPLIES, INTENTS } from "../src/data/chatReplies.js";

const cfg = {
  gentleLowDays: 3,
  connectLowDays: 5,
  urgentLowDays: 10,
  phq9Connect: 10,
  phq9Urgent: 20,
  gad7Connect: 10,
};
const today = "2026-11-10";

const moodsFor = (n, mood = "low", end = today) =>
  [...Array(n)].map((_, i) => {
    const d = new Date(`${end}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    return { date: d.toISOString().slice(0, 10), mood };
  });

const assess = (over = {}) => assessLevel({ moods: [], screenings: [], crisisCount: 0, today, ...over }, cfg);

describe("assessLevel", () => {
  it("is 0 with no data", () => expect(assess().level).toBe(0));

  it("climbs with the length of the low streak (thresholds come from config)", () => {
    expect(assess({ moods: moodsFor(2) }).level).toBe(0);
    expect(assess({ moods: moodsFor(3) }).level).toBe(1);
    expect(assess({ moods: moodsFor(5) }).level).toBe(2);
    expect(assess({ moods: moodsFor(10) }).level).toBe(3);
    const stricter = assessLevel(
      { moods: moodsFor(2), screenings: [], crisisCount: 0, today },
      { ...cfg, gentleLowDays: 2 }
    );
    expect(stricter.level).toBe(1);
  });

  it("counts a streak ending yesterday when today isn't logged, but not an older one", () => {
    const toMap = (list) => new Map(list.map((m) => [m.date, m.mood]));
    expect(lowStreak(toMap(moodsFor(4, "low", "2026-11-09")), today)).toBe(4);
    expect(lowStreak(toMap(moodsFor(4, "low", "2026-11-07")), today)).toBe(0);
  });

  it("a good day today breaks the streak", () => {
    const moods = [...moodsFor(4, "low", "2026-11-09"), { date: today, mood: "good" }];
    expect(assess({ moods }).level).toBe(0);
  });

  it("uses screenings: moderate = 2, severe = 3, flagged item = 3", () => {
    const phq = (score, extra = {}) => ({ type: "PHQ-9", score, severity: "x", selfHarmFlag: false, ...extra });
    expect(assess({ screenings: [phq(9)] }).level).toBe(0);
    expect(assess({ screenings: [phq(10)] }).level).toBe(2);
    expect(assess({ screenings: [phq(20)] }).level).toBe(3);
    expect(assess({ screenings: [phq(1, { selfHarmFlag: true })] }).level).toBe(3);
    const gad = { type: "GAD-7", score: 10, severity: "Moderate", selfHarmFlag: false };
    expect(assess({ screenings: [gad] }).level).toBe(2);
  });

  it("uses only the newest screening of each type", () => {
    const newestFirst = [
      { type: "PHQ-9", score: 2, severity: "Minimal", selfHarmFlag: false },
      { type: "PHQ-9", score: 25, severity: "Severe", selfHarmFlag: false },
    ];
    expect(assess({ screenings: newestFirst }).level).toBe(0);
  });

  it("explains itself in reasons", () => {
    expect(assess({ moods: moodsFor(6) }).reasons[0]).toMatch(/6 days in a row/);
  });
});

describe("a low stretch that has already ended", () => {
  const withLookback = (days) => ({ ...cfg, pastRunLookbackDays: days });
  const assessPast = (moods, lookback = 30) =>
    assessLevel({ moods, screenings: [], crisisCount: 0, today }, withLookback(lookback));
  const ended = moodsFor(12, "low", "2026-10-25"); // 14 to 25 Oct, 16 days before "today"

  it("still raises support, but only to 'connect', never to helplines", () => {
    const a = assessPast(ended);
    expect(a.level).toBe(2);
    expect(a.signals.lowStreak).toBe(0);
    expect(a.signals.pastRun).toMatchObject({ length: 12, start: "2026-10-14", end: "2026-10-25" });
    expect(a.reasons[0]).toBe("You logged a low or rough mood 12 days in a row (14 Oct to 25 Oct).");
  });

  it("follows the same thresholds as a current streak", () => {
    expect(assessPast(moodsFor(2, "low", "2026-10-25")).level).toBe(0);
    expect(assessPast(moodsFor(3, "low", "2026-10-25")).level).toBe(1);
    expect(assessPast(moodsFor(5, "low", "2026-10-25")).level).toBe(2);
  });

  it("stops counting once it is older than the look-back, or when the look-back is 0", () => {
    expect(assessPast(ended, 15).level).toBe(0);
    expect(assessPast(ended, 16).level).toBe(2);
    expect(assessPast(ended, 0).level).toBe(0);
  });

  it("is forgotten once a good or great day has been logged since, but not an okay day", () => {
    expect(assessPast([...ended, { date: "2026-10-30", mood: "good" }]).level).toBe(0);
    expect(assessPast([...ended, { date: "2026-10-30", mood: "great" }]).level).toBe(0);
    expect(assessPast([...ended, { date: "2026-10-30", mood: "okay" }]).level).toBe(2);
  });

  it("uses the longest recent run, and a current streak is not capped", () => {
    const shorter = moodsFor(4, "low", "2026-10-30");
    expect(assessPast([...ended, ...shorter]).signals.pastRun.length).toBe(12);
    expect(assessPast(moodsFor(10, "low", today)).level).toBe(3);
  });

  it("does not repeat a current streak as a past one", () => {
    const a = assessPast(moodsFor(5, "low", today));
    expect(a.signals.pastRun).toBeNull();
    expect(a.reasons).toHaveLength(1);
  });
});

describe("pickRotating", () => {
  const items = ["a", "b", "c", "d", "e", "f"];

  it("returns a stable set for a day and a different one the next", () => {
    expect(pickRotating(items, 3, 10)).toEqual(pickRotating(items, 3, 10));
    expect(pickRotating(items, 3, 10)).not.toEqual(pickRotating(items, 3, 11));
  });

  it("handles small and empty lists", () => {
    expect(pickRotating([], 3, 5)).toEqual([]);
    expect(pickRotating(["x"], 3, 5)).toEqual(["x"]);
  });
});

describe("weekdayWeekendPatterns", () => {
  it("needs a few days of each before comparing", () => {
    const p = weekdayWeekendPatterns(new Map([["2026-11-09", 3]]), today);
    expect(p.difference).toBeNull();
    expect(p.variability).toBeNull();
  });

  it("labels steady and variable moods", () => {
    const steady = new Map(moodsFor(14, "good").map((m) => [m.date, 4]));
    expect(weekdayWeekendPatterns(steady, today).variability.label).toBe("steady");

    const swingy = new Map(moodsFor(14, "good").map((m, i) => [m.date, i % 2 === 0 ? 1 : 5]));
    expect(weekdayWeekendPatterns(swingy, today).variability.label).toBe("variable");
  });
});

describe("built-in chat (no AI key)", () => {
  const bot = (text) => ({ role: "bot", text });

  it("understands greetings and small talk instead of giving the generic reply", () => {
    for (const msg of ["whats up", "what's up", "hi", "Hello!", "hey there", "good morning", "sup"]) {
      expect(classify(msg).id, msg).toBe("greeting");
    }
    expect(classify("how are you?").id).toBe("how-are-you");
    expect(classify("who are you").id).toBe("who-are-you");
    expect(classify("are you a bot?").id).toBe("who-are-you");
    expect(DEFAULT_REPLIES).not.toContain(fallbackReply("whats up", { name: "Ishwari" }));
    expect(fallbackReply("whats up", { name: "Ishwari" })).toMatch(/\?$/);
  });

  it("picks up many feelings", () => {
    const cases = {
      "I'm so anxious about tomorrow": "panic-anxiety",
      "I feel overwhelmed": "overwhelm-stress",
      "I feel really sad today": "sad-low",
      "I'm so lonely": "lonely",
      "I'm furious with my manager": "angry",
      "I can't sleep": "tired-sleep",
      "my grandmother passed away": "grief",
      "I had a fight with my boyfriend": "relationships",
      "my boss keeps piling work on me": "work-study",
      "I'm bored": "bored",
      "thanks a lot": "thanks",
      "ok bye": "goodbye",
      "what should I do": "needs-advice",
    };
    for (const [msg, id] of Object.entries(cases)) expect(classify(msg).id, msg).toBe(id);
  });

  it("understands everyday topics and small talk beyond the basics", () => {
    const cases = {
      "I just want to talk": "wants-to-talk",
      "i keep overthinking everything": "overthinking",
      "I hate myself": "self-esteem",
      "I'm so stupid": "self-esteem",
      "I have no motivation": "motivation",
      "I failed my exam": "exam",
      "my mom keeps pressuring me": "family",
      "I have a headache": "physical",
      "tell me a joke": "jokes",
      "I need a hug": "hug",
      "you're so sweet": "compliment",
      "you are so dumb": "insult",
      "what are you doing": "doing",
      "lol": "laugh",
      "idk": "idk",
      "I'm fine": "fine-mask",
      "fine": "fine-mask",
    };
    for (const [msg, id] of Object.entries(cases)) expect(classify(msg).id, msg).toBe(id);
  });

  it("echoes back what the person feels when nothing else matches", () => {
    expect(classify("i feel like things are slipping away from me").id).toBe("reflect");
    const reply = fallbackReply("i feel like things are slipping away from me", { name: "A" });
    expect(reply).toContain("like things are slipping away from you");
    expect(reply).not.toMatch(/[{}]/);
  });

  it("acknowledges a long message instead of giving a one-line reply", () => {
    const long = "so basically yesterday things went sideways at the shop and then the train was late and after that the whole evening disappeared";
    expect(classify(long).id).toBe("long");
  });

  it("gives every intent at least two replies", () => {
    const thin = INTENTS.filter((i) => i.replies.length < 2).map((i) => i.id);
    expect(thin).toEqual([]);
  });

  it("treats 'not good' as a bad day, not a good one", () => {
    expect(classify("I'm not feeling good").id).toBe("not-good");
    expect(classify("I'm feeling great today").id).toBe("positive");
  });

  it("uses the person's name and never leaves a placeholder behind", () => {
    const history = [];
    const replies = [];
    for (let i = 0; i < 6; i++) {
      replies.push(fallbackReply("hi", { history, name: "Ishwari" }));
      history.push(bot("x"));
    }
    expect(replies.some((r) => r.includes("Ishwari"))).toBe(true);
    expect(replies.every((r) => !/[{}]/.test(r))).toBe(true);
    expect(fallbackReply("hi")).not.toMatch(/[{}]/);
  });

  it("understands yes and no to what it just asked", () => {
    const offered = [bot("Would you like to try a quick 1-minute box breathing round together?")];
    expect(classify("yes please", offered).id).toBe("follow-up-yes");
    expect(fallbackReply("yes please", { history: offered })).toMatch(/4/);
    expect(classify("no thanks", offered).id).toBe("follow-up-no");
    expect(classify("yes", []).id).toBe("ack");
  });

  it("does not repeat itself on the same message", () => {
    const seen = new Set();
    const history = [];
    for (let i = 0; i < 3; i++) {
      seen.add(fallbackReply("hi", { history, name: "A" }));
      history.push(bot("x"));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("every intent has several replies and a valid pattern", () => {
    for (const intent of INTENTS) {
      expect(intent.replies.length, intent.id).toBeGreaterThan(0);
      expect(intent.match.length, intent.id).toBeGreaterThan(0);
    }
  });

  it("falls back to an open question for things it doesn't recognise", () => {
    expect(classify("blorp zindle").id).toBe("default");
    expect(fallbackReply("blorp zindle", { name: "A" })).toMatch(/\?$/);
  });
});

describe("crisis wording", () => {
  const helplines = [
    { kind: "emergency", title: "112 - Emergency", phone: "112", hours: "24 hours, every day" },
    { kind: "helpline", title: "Tele-MANAS", phone: "14416", hours: "24 hours, every day" },
    { kind: "helpline", title: "iCall", phone: "9152987821", hours: "Mon to Sat, 8 am to 9 pm" },
  ];

  it("is built from the helplines it is given", () => {
    const msg = crisisMessage(helplines);
    expect(msg).toContain("112");
    expect(msg).toContain("Tele-MANAS 14416");
    expect(msg).not.toContain("9152987821");
  });

  it("never invents a number when there is no data", () => {
    expect(crisisMessage([])).not.toMatch(/\d{3,}/);
  });

  it("detects self-harm language", () => {
    expect(isCrisis("I want to end my life")).toBe(true);
    expect(isCrisis("I had a long day at work")).toBe(false);
  });
});
