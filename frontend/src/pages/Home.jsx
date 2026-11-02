import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp, MOODS, moodValue } from "../context/AppContext.jsx";
import { api } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import { addDaysISO, toISODate } from "../lib/dates.js";
import { IconClipboard, IconChat, IconChevronRight, IconWave, IconHeart } from "../components/Icons.jsx";
import { HelplineList } from "../components/SupportLists.jsx";
import SupportAlert from "../components/SupportAlert.jsx";
import { useSupportAlert } from "../api/useSupportAlert.js";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const average = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null);

export default function Home() {
  const { user } = useApp();
  const today = toISODate();
  const from = addDaysISO(today, -13);
  const { data, error, setData } = useAsync(() => api.get(`/moods?from=${from}&to=${today}`), [from, today]);
  const [saveError, setSaveError] = useState("");
  const guidance = useAsync(() => api.get(`/support/guidance?today=${today}`), [today, data]);
  const g = guidance.data;
  const supportAlert = useSupportAlert();
  const checkAlert = supportAlert.check;

  // Opening Home is a natural moment to tell someone support is available (once per level per day).
  useEffect(() => {
    checkAlert();
  }, [checkAlert]);

  const moods = data?.moods ?? [];
  const byDate = new Map(moods.map((m) => [m.date, m.mood]));
  const todayMood = byDate.get(today);

  const logMood = async (mood) => {
    const previous = data;
    setSaveError("");
    setData({ moods: [...moods.filter((m) => m.date !== today), { date: today, mood }] });
    try {
      await api.put(`/moods/${today}`, { mood });
    } catch {
      setData(previous);
      setSaveError("Couldn't save your mood. Please try again.");
      return;
    }
    checkAlert();
  };

  const last7 = [...Array(7)].map((_, i) => {
    const key = addDaysISO(today, -(6 - i));
    const mood = byDate.get(key);
    return { key, value: mood ? moodValue(mood) : 0, isToday: key === today };
  });
  const currentAvg = average(last7.filter((d) => d.value > 0).map((d) => d.value));
  const previousAvg = average(
    [...Array(7)].map((_, i) => byDate.get(addDaysISO(today, -(7 + i)))).filter(Boolean).map(moodValue)
  );

  let changePct = null;
  let changeLabel = "Check in a few days in a row to see your trend";
  if (currentAvg && previousAvg) {
    changePct = Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
    changeLabel =
      changePct >= 0 ? `Mood stability improved by ${changePct}%` : `Mood dipped ${Math.abs(changePct)}% from last week`;
  }

  return (
    <div>
      <div className="home-header">
        <div>
          <h1>{greeting()}, {user.firstName} ☀️</h1>
          <p>We are so glad you are here today.</p>
        </div>
        <div className="avatar">{user.initials}</div>
      </div>

      <div className="card">
        <h3>How are you feeling today?</h3>
        <div className="mood-picker">
          {MOODS.map((m) => (
            <button
              key={m.key}
              className={`mood-option mood-${m.key}` + (todayMood === m.key ? " mood-option--active" : "")}
              onClick={() => logMood(m.key)}
            >
              <span className="mood-emoji">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
        {(saveError || error) && <p className="form-error" role="alert">{saveError || error.message}</p>}
      </div>

      {g && g.level >= 3 && (
        <div className="card support-banner support-banner--l3" style={{ marginTop: 16 }}>
          <h3>{g.headline}</h3>
          <p className="card-subtext">{g.message}</p>
          <HelplineList helplines={g.helplines.slice(0, 2)} />
          <Link to="/support" className="link-btn" style={{ display: "inline-block", marginTop: 14 }}>
            See all support options
          </Link>
        </div>
      )}

      {g && g.level >= 1 && g.level < 3 && (
        <Link to="/support" className={`action-card support-card support-card--l${g.level}`} style={{ marginTop: 16 }}>
          <div className="action-icon">{g.level === 2 ? "🤝" : "🌿"}</div>
          <div className="action-body">
            <h4>{g.headline}</h4>
            <p>{g.message}</p>
          </div>
          <span className="chevron"><IconChevronRight /></span>
        </Link>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head-row">
          <h3>Weekly Focus</h3>
          {changePct !== null && <span className="pill-stat">{changePct >= 0 ? "+" : ""}{changePct}%</span>}
        </div>
        <p className="card-subtext">{changeLabel}</p>
        <div className="mini-bars">
          {last7.map((d) => (
            <div
              key={d.key}
              className={"mini-bar" + (d.isToday ? " mini-bar--today" : "")}
              style={{ height: `${Math.max(d.value * 16, 8)}px` }}
            />
          ))}
        </div>
      </div>

      <Link to="/screening/phq9" className="action-card action-card--peach" style={{ marginTop: 16 }}>
        <div className="action-icon">
          <IconClipboard />
        </div>
        <div className="action-body">
          <h4>Continue Your Journey</h4>
          <p>Complete your weekly PHQ-9 screening.</p>
        </div>
        <span className="chevron"><IconChevronRight /></span>
      </Link>

      <Link to="/chat" className="action-card action-card--white" style={{ marginTop: 16 }}>
        <div className="action-icon action-icon--round">
          <IconChat />
        </div>
        <div className="action-body">
          <h4>Talk to MindMate</h4>
          <p>Your non-judgmental friend, active 24/7.</p>
        </div>
      </Link>

      <Link to="/coping" className="action-card action-card--white" style={{ marginTop: 16 }}>
        <div className="action-icon" style={{ background: "var(--accent-blue)" }}>
          <IconWave />
        </div>
        <div className="action-body">
          <h4>Coping Space</h4>
          <p>Guided exercises to lower nervous system stress.</p>
        </div>
        <span className="chevron"><IconChevronRight /></span>
      </Link>

      {(!g || g.level === 0) && (
        <Link to="/support" className="action-card action-card--white" style={{ marginTop: 16 }}>
          <div className="action-icon" style={{ background: "var(--mood-great-bg)" }}>🌿</div>
          <div className="action-body">
            <h4>Support &amp; Resources</h4>
            <p>Ideas, places to go, and people to talk to.</p>
          </div>
          <span className="chevron"><IconChevronRight /></span>
        </Link>
      )}

      <Link to="/book" className="action-card action-card--white" style={{ marginTop: 16 }}>
        <div className="action-icon" style={{ background: "var(--mood-low-bg)" }}>
          <IconHeart />
        </div>
        <div className="action-body">
          <h4>Book Clinical Support</h4>
          <p>Talk with compassionate, vetted trauma specialists.</p>
        </div>
        <span className="chevron"><IconChevronRight /></span>
      </Link>

      <SupportAlert guidance={supportAlert.alert} onClose={supportAlert.dismiss} />
    </div>
  );
}
