import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);
const STORAGE_KEY = "mindmate-state-v1";

function fmt(date) {
  return date.toISOString().slice(0, 10);
}

function moodValue(mood) {
  return { rough: 1, low: 2, okay: 3, good: 4, great: 5 }[mood] ?? 3;
}

const MOODS = [
  { key: "great", emoji: "🥰", label: "great" },
  { key: "good", emoji: "😊", label: "good" },
  { key: "okay", emoji: "😐", label: "okay" },
  { key: "low", emoji: "😔", label: "low" },
  { key: "rough", emoji: "😭", label: "rough" },
];

const JOURNAL_SEEDS = [
  {
    text: "Woke up feeling refreshed. Had a warm cup of cardamom chai and spent 10 minutes breathing deeply before starting my emails.",
    tags: ["Sleep", "Health"],
    period: "Morning entry",
    mood: "good",
  },
  {
    text: "Dinner with friends was deeply therapeutic. Felt safe sharing some stress points regarding project handovers.",
    tags: ["Relationships", "Work"],
    period: "Evening entry",
    mood: "great",
  },
];

function seedState() {
  const today = new Date();
  const moodEntries = [];
  const journalEntries = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 400; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (rand() < 0.18) continue; // gaps, matching the blank cells in the design
    const r = rand();
    let mood = "okay";
    if (r < 0.34) mood = "great";
    else if (r < 0.62) mood = "good";
    else if (r < 0.78) mood = "okay";
    else if (r < 0.92) mood = "low";
    else mood = "rough";
    moodEntries.push({ date: fmt(d), mood });
  }

  JOURNAL_SEEDS.forEach((seedEntry, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (JOURNAL_SEEDS.length - 1 - idx));
    journalEntries.unshift({
      id: `seed-${idx}`,
      date: fmt(d),
      period: seedEntry.period,
      mood: seedEntry.mood,
      text: seedEntry.text,
      tags: seedEntry.tags,
    });
  });

  return {
    authed: false,
    user: { firstName: "", email: "", initials: "" },
    moodEntries,
    journalEntries,
    screenings: [
      { id: "s1", type: "PHQ-9", date: "Oct 24", score: 4, max: 27, label: "Minimal" },
      { id: "s2", type: "GAD-7", date: "Oct 17", score: 6, max: 21, label: "Mild" },
    ],
    chatMessages: [
      {
        id: "m1",
        from: "bot",
        text: "Hello. I'm here in your safe space. Whatever is on your mind, we can sort through it gently, without judgment. How is your energy right now?",
      },
    ],
    notifications: {
      dailyCheckin: true,
      weeklySummary: false,
      aiTips: true,
    },
    booking: null,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    return { ...seedState(), ...parsed };
  } catch {
    return seedState();
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => {
    return {
      state,

      signUp: ({ firstName, email }) => {
        const initials = firstName
          .trim()
          .split(/\s+/)
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        setState((s) => ({
          ...s,
          authed: true,
          user: { firstName, email, initials: initials || "U" },
        }));
      },

      logIn: (email) => {
        setState((s) => ({
          ...s,
          authed: true,
          user: s.user.firstName
            ? s.user
            : { firstName: "Asavari", email, initials: "AS" },
        }));
      },

      signOut: () => {
        setState((s) => ({ ...s, authed: false }));
      },

      deleteAccount: () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(seedState());
      },

      logMood: (mood, date = fmt(new Date())) => {
        setState((s) => {
          const rest = s.moodEntries.filter((m) => m.date !== date);
          return { ...s, moodEntries: [...rest, { date, mood }] };
        });
      },

      addJournalEntry: (entry) => {
        setState((s) => ({
          ...s,
          journalEntries: [
            { id: `j-${Date.now()}`, ...entry },
            ...s.journalEntries,
          ],
        }));
      },

      addScreening: (screening) => {
        setState((s) => ({
          ...s,
          screenings: [
            { id: `sc-${Date.now()}`, ...screening },
            ...s.screenings,
          ],
        }));
      },

      sendChatMessage: (text) => {
        const id = `m-${Date.now()}`;
        setState((s) => ({
          ...s,
          chatMessages: [...s.chatMessages, { id, from: "user", text }],
        }));
        return id;
      },

      addBotMessage: (text) => {
        setState((s) => ({
          ...s,
          chatMessages: [
            ...s.chatMessages,
            { id: `m-${Date.now()}-bot`, from: "bot", text },
          ],
        }));
      },

      setNotification: (key, value) => {
        setState((s) => ({
          ...s,
          notifications: { ...s.notifications, [key]: value },
        }));
      },

      setBooking: (booking) => {
        setState((s) => ({ ...s, booking }));
      },
    };
  }, [state]);

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { MOODS, moodValue, fmt };
