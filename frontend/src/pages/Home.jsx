import { Link } from "react-router-dom";
import { useApp, MOODS, moodValue, fmt } from "../context/AppContext.jsx";
import { IconClipboard, IconChat, IconChevronRight, IconWave, IconHeart } from "../components/Icons.jsx";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { state, logMood } = useApp();
  const today = fmt(new Date());
  const todayMood = state.moodEntries.find((m) => m.date === today)?.mood;

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = fmt(d);
    const entry = state.moodEntries.find((m) => m.date === key);
    return { key, value: entry ? moodValue(entry.mood) : 0, isToday: key === today };
  });

  const prev7Avg = (() => {
    const vals = [];
    for (let i = 13; i >= 7; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const entry = state.moodEntries.find((m) => m.date === fmt(d));
      if (entry) vals.push(moodValue(entry.mood));
    }
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const curr7Vals = last7.filter((d) => d.value > 0).map((d) => d.value);
  const curr7Avg = curr7Vals.length ? curr7Vals.reduce((a, b) => a + b, 0) / curr7Vals.length : null;

  let changeLabel = "Keep checking in to see your trend";
  let changePct = null;
  if (prev7Avg && curr7Avg) {
    const pct = Math.round(((curr7Avg - prev7Avg) / prev7Avg) * 100);
    changePct = pct;
    changeLabel = pct >= 0 ? `Mood stability improved by ${pct}%` : `Stress levels decreased by ${Math.abs(pct)}%`;
  }

  return (
    <div>
      <div className="home-header">
        <div>
          <h1>{greeting()}, {state.user.firstName || "there"} ☀️</h1>
          <p>We are so glad you are here today.</p>
        </div>
        <div className="avatar">{state.user.initials || "U"}</div>
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
      </div>

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
    </div>
  );
}
