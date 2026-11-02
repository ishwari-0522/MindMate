import {
  ACK_REPLIES,
  DEFAULT_REPLIES,
  FOLLOW_UPS,
  INTENTS,
  LONG_REPLIES,
  NO,
  REFLECT_REPLIES,
  YES,
} from "../data/chatReplies.js";

const CRISIS_PATTERNS = [
  /\bkill(ing)? myself\b/i,
  /\bsuicid/i,
  /\bend(ing)? my (own )?life\b/i,
  /\bwant(ed)? to die\b/i,
  /\bbetter off dead\b/i,
  /\b(hurt|harm)(ing)? myself\b/i,
  /\bself[- ]?harm/i,
  /\bno reason to live\b/i,
  /\bdon'?t want to (be here|live|exist)\b/i,
];

export function isCrisis(text) {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

const lastBotMessage = (history) => [...history].reverse().find((m) => m.role === "bot")?.text ?? "";

// Which intent a message matches (or a yes/no follow-up to what MindMate just said). Exported so it can be tested.
export function classify(text, history = []) {
  const last = lastBotMessage(history);
  const isYes = YES.test(text);
  const isNo = NO.test(text);
  if ((isYes || isNo) && text.trim().split(/\s+/).length <= 5) {
    const follow = FOLLOW_UPS.find((f) => f.afterBotSaid.test(last));
    if (follow) return { id: `follow-up-${isYes ? "yes" : "no"}`, replies: isYes ? follow.yes : follow.no };
    if (!INTENTS.some((i) => i.match.some((re) => re.test(text)))) return { id: "ack", replies: ACK_REPLIES };
  }
  const intent = INTENTS.find((i) => i.match.some((re) => re.test(text)));
  if (intent) return intent;
  const feeling = reflectFeeling(text);
  if (feeling) return { id: "reflect", replies: REFLECT_REPLIES, feeling };
  if (text.trim().split(/\s+/).length >= LONG_MESSAGE_WORDS) return { id: "long", replies: LONG_REPLIES };
  return { id: "default", replies: DEFAULT_REPLIES };
}

const LONG_MESSAGE_WORDS = 18;

// "I feel like nobody listens" -> "like nobody listens" (switched to second person), so a reply can echo it back.
export function reflectFeeling(text) {
  const m = /\bi(?:'m| am)? feel(?:ing)? ([^.,!?;]{2,40})/i.exec(text);
  if (!m) return null;
  const feeling = m[1]
    .split(/\b(?:because|but|and|when|since|cause)\b/i)[0]
    .replace(/^(?:so|really|very|just|kind of|a bit|a little|pretty)\s+/i, "")
    .replace(/\bmyself\b/gi, "yourself")
    .replace(/\b(?:my)\b/gi, "your")
    .replace(/\b(?:i|me)\b/gi, "you")
    .trim();
  return feeling.length >= 2 ? feeling : null;
}

// The built-in chat, used when no AI key is set. Picks a different reply each time so it doesn't repeat itself.
export function fallbackReply(text, { history = [], name = "" } = {}) {
  const { replies, feeling } = classify(text, history);
  const botTurns = history.filter((m) => m.role === "bot").length;
  const reply = replies[(botTurns + text.length) % replies.length];
  return reply.replace(/\{name\}/g, name || "friend").replace(/\{feeling\}/g, feeling ?? "that way");
}

const SYSTEM_PROMPT = `You are MindMate, a warm, calm, non-judgmental wellbeing companion inside a mental wellness app.
- You are not a therapist or doctor. Never diagnose, never give medication advice.
- Reply in 2-4 short sentences, plain language, no lists, no emojis unless the user uses them.
- Reflect feelings first, then offer at most one small, concrete step (breathing, journaling, a short walk, or booking a clinician in the app).
- The user is in India. If the user describes thoughts of self-harm or suicide, respond with care and urge them to contact local emergency services or a crisis line, but never state phone numbers yourself; the app shows verified ones.
- If the user has felt low for a while, suggest gentle things like a walk in daylight, time with a friend, or the app's Support page, and mention that talking to a doctor or counsellor is a good option. Do not push helplines unless there is risk of harm.
- Never claim to remember things outside this conversation.`;

function toAnthropicMessages(history, text) {
  const out = [];
  for (const m of [...history, { role: "user", text }]) {
    const role = m.role === "bot" ? "assistant" : "user";
    if (out.length === 0 && role === "assistant") continue; // API requires the first turn to be the user's
    if (out.length && out[out.length - 1].role === role) {
      out[out.length - 1].content += `\n${m.text}`;
    } else {
      out.push({ role, content: m.text });
    }
  }
  return out;
}

export async function generateReply({ history, text, firstName, config }) {
  const fallback = () => fallbackReply(text, { history, name: firstName });
  if (!config.anthropicApiKey) return fallback();
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.chatModel,
        max_tokens: 300,
        system: `${SYSTEM_PROMPT}\nThe user's first name is ${firstName}.`,
        messages: toAnthropicMessages(history, text),
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`Anthropic API ${res.status}`);
    const data = await res.json();
    const reply = data.content?.find((b) => b.type === "text")?.text?.trim();
    return reply || fallback();
  } catch (err) {
    console.error("[chat] AI reply failed, using fallback:", err.message);
    return fallback();
  }
}
