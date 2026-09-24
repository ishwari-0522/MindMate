import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp, MOODS, moodValue, fmt } from "../context/AppContext.jsx";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function moodLabelFromValue(v) {
  const rounded = Math.round(v);
  return MOODS.find((m) => moodValue(m.key) === rounded) ?? MOODS[2];
}

export default function Trends() {
  const { state } = useApp();
  const [range, setRange] = useState("Week");

  const entriesByDate = useMemo(() => {
    const map = {};
    state.moodEntries.forEach((m) => (map[m.date] = m.mood));
    return map;
  }, [state.moodEntries]);

  const weekBars = useMemo(() => {
    const today = new Date();
    const dow = (today.getDay() + 6) % 7; // Monday=0
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow);
    return WEEK_LABELS.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const mood = entriesByDate[fmt(d)];
      return { label, value: mood ? moodValue(mood) : 0, isPeak: false };
    });
  }, [entriesByDate]);

  const monthBars = useMemo(() => {
    const today = new Date();
    const weeks = [[], [], [], []];
    for (let i = 0; i < 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (27 - i));
      const mood = entriesByDate[fmt(d)];
      if (mood) weeks[Math.floor(i / 7)].push(moodValue(mood));
    }
    return weeks.map((vals, i) => ({
      label: `Wk ${i + 1}`,
      value: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
    }));
  }, [entriesByDate]);

  const yearBars = useMemo(() => {
    const today = new Date();
    return MONTH_LABELS.map((label, i) => {
      const vals = [];
      state.moodEntries.forEach((m) => {
        const d = new Date(m.date);
        if (d.getMonth() === i && d.getFullYear() === today.getFullYear()) {
          vals.push(moodValue(m.mood));
        }
      });
      return { label, value: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
    });
  }, [state.moodEntries]);

  const dataset = range === "Week" ? weekBars : range === "Month" ? monthBars : yearBars;
  const maxVal = 5;
  const nonZero = dataset.filter((d) => d.value > 0);
  const peakIndex = nonZero.length
    ? dataset.indexOf(nonZero.reduce((a, b) => (b.value > a.value ? b : a)))
    : -1;

  const avg = nonZero.length ? nonZero.reduce((a, b) => a + b.value, 0) / nonZero.length : null;
  const avgMood = avg ? moodLabelFromValue(avg) : null;

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    if (!entriesByDate[fmt(d)]) d.setDate(d.getDate() - 1);
    while (entriesByDate[fmt(d)]) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [entriesByDate]);

  const topTrigger = useMemo(() => {
    const counts = {};
    state.journalEntries.forEach((e) => e.tags.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "Work";
  }, [state.journalEntries]);

  const subtitle =
    range === "Week"
      ? "Consistently improving this week"
      : range === "Month"
      ? "A steady month of self check-ins"
      : "Your full year of emotional patterns";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Wellness Trends</h1>
          <p>Track your path to mental clarity</p>
        </div>
      </div>

      <div className="segmented">
        {["Week", "Month", "Year"].map((r) => (
          <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>
            {r}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-head-row">
          <h3>Mood Stability</h3>
          {avg && <span className="pill-stat">{avg >= 3.5 ? "+" : ""}{Math.round(((avg - 3) / 3) * 100)}%</span>}
        </div>
        <p className="card-subtext">{subtitle}</p>
        <div className="bars-chart">
          {dataset.map((d, i) => (
            <div className="bar-col" key={d.label}>
              <div
                className={"bar" + (i === peakIndex ? " bar--peak" : "")}
                style={{ height: `${Math.max((d.value / maxVal) * 100, d.value ? 8 : 4)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="bar-labels">
          {dataset.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <div className="stat-dot" style={{ background: "var(--mood-great-bg)" }} />
          <h4>{avgMood ? `${avgMood.emoji} ${avgMood.label[0].toUpperCase()}${avgMood.label.slice(1)}` : "—"}</h4>
          <p>Avg. Mood</p>
        </div>
        <div className="stat-tile">
          <div className="stat-dot" style={{ background: "var(--primary)" }} />
          <h4>{streak} Days</h4>
          <p>Active Streak</p>
        </div>
        <div className="stat-tile">
          <div className="stat-dot" style={{ background: "var(--accent-peach)" }} />
          <h4>💼 {topTrigger}</h4>
          <p>Top Trigger</p>
        </div>
      </div>

      <h2 className="section-title">Clinical Screenings</h2>
      <div className="scroll-row">
        {state.screenings.map((s) => (
          <Link
            to={`/screening/${s.type === "PHQ-9" ? "phq9" : "gad7"}`}
            className="screening-card"
            key={s.id}
          >
            <p className="date">{s.date}</p>
            <h4>{s.type} {s.type === "PHQ-9" ? "Depression" : "Anxiety"}</h4>
            <span className="score-pill">Score: {s.score}/{s.max}</span>
            <p className="severity">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
