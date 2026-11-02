import { useCallback, useState } from "react";
import { api } from "./client.js";
import { useApp } from "../context/AppContext.jsx";
import { toISODate } from "../lib/dates.js";

// Asks the server whether this person needs support and, if so, returns the alert to show.
// Each level is shown once per day, so saving several entries in a row doesn't repeat it.
export function useSupportAlert() {
  const { user } = useApp();
  const [alert, setAlert] = useState(null);

  const check = useCallback(async () => {
    try {
      const today = toISODate();
      const guidance = await api.get(`/support/guidance?today=${today}`);
      if (guidance.level < 1) return;
      const key = `mm.supportAlert.${user.id}.${today}`;
      let shown = 0;
      try {
        shown = Number(localStorage.getItem(key)) || 0;
      } catch {
        // storage unavailable: just show it
      }
      if (guidance.level <= shown) return;
      try {
        localStorage.setItem(key, String(guidance.level));
      } catch {
        // storage unavailable: it may show again next time
      }
      setAlert(guidance);
    } catch {
      // the alert is an extra, so a failure here never gets in the way of saving
    }
  }, [user.id]);

  return { alert, check, dismiss: () => setAlert(null) };
}
