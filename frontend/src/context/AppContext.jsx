import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler } from "../api/client.js";

const AppContext = createContext(null);

export function moodValue(mood) {
  return { rough: 1, low: 2, okay: 3, good: 4, great: 5 }[mood] ?? 3;
}

export const MOODS = [
  { key: "great", emoji: "🥰", label: "great" },
  { key: "good", emoji: "😊", label: "good" },
  { key: "okay", emoji: "😐", label: "okay" },
  { key: "low", emoji: "😔", label: "low" },
  { key: "rough", emoji: "😭", label: "rough" },
];

// `user` is undefined while we check for an existing session, null when signed out.
export function AppProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api
      .get("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setUser(null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: user === undefined,

      signUp: async (body) => setUser((await api.post("/auth/signup", body)).user),
      logIn: async (body) => setUser((await api.post("/auth/login", body)).user),
      signOut: async () => {
        try {
          await api.post("/auth/logout");
        } finally {
          setUser(null);
        }
      },
      deleteAccount: async () => {
        await api.del("/me");
        setUser(null);
      },
      updateNotification: async (key, enabled) => {
        const previous = user;
        setUser((u) => ({ ...u, notifications: { ...u.notifications, [key]: enabled } }));
        try {
          setUser((await api.patch("/me", { notifications: { [key]: enabled } })).user);
        } catch (err) {
          setUser(previous);
          throw err;
        }
      },
    }),
    [user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
