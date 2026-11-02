// Content for the "feeling low" support ladder. Seeded into the SupportResource collection on start.
// Edit here (or directly in the database) - no code changes needed.
//
// minLevel: 1 = shown once someone has had a few low days, 2 = also when it has gone on longer or screenings
//           are elevated, 3 = only when things look serious. Helplines are level 3 on purpose: they are not
//           pushed at people who just need a lift.
//
// Helplines were checked against each service's own site on 2026-11-01. Numbers change, so re-verify before launch.

const maps = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const ACTIVITIES = [
  {
    key: "activity-daylight-walk",
    title: "Take a 15-minute walk in daylight",
    description: "Natural light and gentle movement can lift your energy. Leave your phone in your pocket if you can.",
  },
  {
    key: "activity-move-body",
    title: "Move your body for 10 minutes",
    description: "Stretch, dance around your room, or follow a short yoga flow. Small movement counts.",
  },
  {
    key: "activity-message-friend",
    title: "Message one person you trust",
    description: "You don't have to explain everything. \"Thinking of you, want to chat?\" is enough.",
  },
  {
    key: "activity-music",
    title: "Put on music that matches or lifts your mood",
    description: "Make a short playlist you can come back to on heavy days.",
  },
  {
    key: "activity-favourite-meal",
    title: "Cook or order something you actually enjoy",
    description: "A warm, familiar meal is a small act of care.",
  },
  {
    key: "activity-tiny-tidy",
    title: "Tidy one small corner",
    description: "A clear desk or shelf can give a quiet sense of progress when everything feels big.",
  },
  {
    key: "activity-creative",
    title: "Spend 20 minutes on something creative",
    description: "Doodle, colour, cook, write, play an instrument. Nobody has to see it.",
  },
  {
    key: "activity-breathing",
    title: "Try a guided breathing session",
    description: "Follow along step by step in the Coping Space.",
    url: "/coping",
  },
];

export const PLACES = [
  { key: "place-park", title: "A nearby park or garden", description: "Greenery and fresh air, even for 20 minutes.", mapsQuery: "parks near me" },
  { key: "place-cafe", title: "A café with a friend", description: "Low-pressure company over something warm.", mapsQuery: "cafes near me" },
  { key: "place-library", title: "A quiet library", description: "Calm, free, and you are around people without having to talk.", mapsQuery: "library near me" },
  { key: "place-lake", title: "A lake, river or seaside walk", description: "Open space and water can help thoughts settle.", mapsQuery: "lake or beach near me" },
  { key: "place-class", title: "A yoga, dance or art class", description: "Something structured to do with your hands or body, around other people.", mapsQuery: "yoga or dance classes near me" },
  { key: "place-bookshop", title: "A bookshop", description: "Browse with no goal. Pick up something light.", mapsQuery: "bookshop near me" },
  { key: "place-volunteer", title: "A volunteering or community group", description: "Helping others, even once, can bring a sense of purpose and connection.", mapsQuery: "volunteer opportunities near me" },
  { key: "place-worship", title: "A place of worship or a quiet reflection space", description: "If it is meaningful to you, sitting somewhere peaceful can be comforting.", mapsQuery: "place of worship near me" },
].map((p) => ({ ...p, url: maps(p.mapsQuery) }));

export const ADVICE = [
  {
    key: "advice-name-it",
    title: "Name what you're feeling",
    description: "Try finishing the sentence \"Right now I feel ___ because ___\". Putting words to it often takes some of the weight off.",
  },
  {
    key: "advice-one-small-win",
    title: "Plan one small win",
    description: "Pick something you can finish in 10 minutes today. Finishing it counts, however small.",
  },
  {
    key: "advice-basics",
    title: "Check the basics",
    description: "Have you eaten, had water, and had a little rest? Low mood hits harder when the body is running on empty.",
  },
  {
    key: "advice-feeds-break",
    title: "Take a break from the news and social feeds",
    description: "Even a few hours offline can lower the noise in your head.",
  },
  {
    key: "advice-kind-voice",
    title: "Talk to yourself the way you'd talk to a friend",
    description: "If a friend told you what you're going through, what would you say to them?",
  },
  {
    key: "advice-sleep-window",
    title: "Keep a steady sleep window",
    description: "Going to bed and waking up at similar times, even on weekends, helps mood steady itself.",
  },
  {
    key: "advice-tell-someone",
    title: "Tell one person how things have really been",
    description: "Saying it out loud to someone who cares can make it feel less heavy.",
    minLevel: 2,
  },
  {
    key: "advice-family-doctor",
    title: "Book a check-up with a doctor you already trust",
    description: "Mood and energy can be affected by sleep, thyroid, vitamin levels and more. A general doctor can look at the whole picture and point you to the right specialist.",
    minLevel: 2,
  },
  {
    key: "advice-campus-or-work-counselling",
    title: "Ask about counselling at your college or workplace",
    description: "Many colleges and employers offer free, confidential counselling sessions or employee assistance programmes.",
    minLevel: 2,
  },
];

// Websites where people can find and book professionals. These are not phone numbers.
export const PLATFORMS = [
  {
    key: "platform-practo",
    title: "Practo",
    description: "Search and book verified psychiatrists and psychologists near you, in person or online.",
    url: "https://www.practo.com",
  },
  {
    key: "platform-amaha",
    title: "Amaha",
    description: "Online therapy and psychiatry, plus in-person centres in some cities.",
    url: "https://amahahealth.com",
  },
  {
    key: "platform-yourdost",
    title: "YourDOST",
    description: "Talk to a counsellor online. Many colleges and workplaces offer it free to their members.",
    url: "https://yourdost.com",
  },
];

export const HELPLINES = [
  {
    key: "helpline-tele-manas",
    kind: "helpline",
    title: "Tele-MANAS",
    description: "Free national mental health helpline run by the Government of India. Counsellors listen and support with stress, anxiety, low mood and thoughts of suicide.",
    phone: "14416",
    hours: "24 hours, every day",
    languages: ["Multiple Indian languages"],
    order: 1,
    source: "Ministry of Health and Family Welfare, run by NIMHANS (alternate toll-free: 1-800-891-4416)",
  },
  {
    key: "helpline-kiran",
    kind: "helpline",
    title: "KIRAN",
    description: "Free national mental health rehabilitation helpline from the Ministry of Social Justice and Empowerment, with trained counsellors.",
    phone: "1800-599-0019",
    hours: "24 hours, every day",
    languages: ["13 languages"],
    order: 2,
    source: "Ministry of Social Justice and Empowerment",
  },
  {
    key: "helpline-aasra",
    kind: "helpline",
    title: "AASRA",
    description: "Confidential support for people in distress or thinking about suicide.",
    phone: "022 2754 6669",
    hours: "24 hours, every day",
    languages: ["English", "Hindi"],
    url: "https://aasra.info",
    order: 3,
    source: "aasra.info/helpline.html",
  },
  {
    key: "helpline-icall",
    kind: "helpline",
    title: "iCall (TISS)",
    description: "Free counselling by trained counsellors from the Tata Institute of Social Sciences.",
    phone: "9152987821",
    hours: "Mon to Sat, 8 am to 9 pm",
    languages: ["English", "Hindi", "and others"],
    url: "https://icallhelpline.org",
    order: 4,
    source: "icallhelpline.org",
  },
  {
    key: "emergency-112",
    kind: "emergency",
    title: "112 - Emergency",
    description: "India's single emergency number. Call it if you or someone else is in immediate danger.",
    phone: "112",
    hours: "24 hours, every day",
    languages: [],
    order: 0,
    source: "Government of India emergency response service",
  },
].map((h) => ({ ...h, minLevel: 3, verifiedOn: "2026-11-01" }));

export const SUPPORT_RESOURCES = [
  ...ACTIVITIES.map((r, i) => ({ minLevel: 1, ...r, kind: "activity", order: i })),
  ...PLACES.map((r, i) => ({ minLevel: 1, ...r, kind: "place", order: i })),
  ...ADVICE.map((r, i) => ({ minLevel: 1, ...r, kind: "advice", order: i })),
  ...PLATFORMS.map((r, i) => ({ minLevel: 2, ...r, kind: "platform", order: i })),
  ...HELPLINES,
];

// What each level says. Wording is deliberately calm and non-diagnostic.
export const LEVEL_COPY = {
  0: {
    name: "steady",
    headline: "You're doing okay",
    message: "Nothing in your recent check-ins suggests you need extra support. Keep noticing how you feel.",
  },
  1: {
    name: "gentle",
    headline: "A little lift for a heavy few days",
    message: "A few lower days in a row happen to everyone. Small, kind things can help. Here are some ideas.",
  },
  2: {
    name: "connect",
    headline: "You don't have to carry this alone",
    message: "It has been a tough stretch. Talking with someone, like a friend, your doctor or a trained professional, can really help. These are good places to start.",
  },
  3: {
    name: "urgent",
    headline: "Please reach out for support today",
    message: "What you've shared suggests things feel very heavy right now. Talking to a trained person can help, and these helplines are free. If you are in immediate danger, call 112.",
  },
};
