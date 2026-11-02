import { useState } from "react";
import { Link } from "react-router-dom";
import { MOODS, moodValue } from "../context/AppContext.jsx";
import { api } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import { addDaysISO, formatShortDate, toISODate } from "../lib/dates.js";
import { IconArrowLeft, IconArrowRight } from "../components/Icons.jsx";

const PERIOD_WORD = { week: "this week", month: "this month", year: "this year" };

function moodFromValue(v) {
  const rounded = Math.round(v);
  return MOODS.find((m) => moodValue(m.key) === rounded) ?? MOODS[2];
}

function subtitle(range, changePct, loggedDays, word = PERIOD_WORD[range]) {
  if (!loggedDays) return word === "that week" ? "No moods logged that week" : "Log your mood to start seeing patterns";
  if (changePct === null) return `Keep checking in to compare ${word}`;
  if (changePct > 0) return `Improving ${word}`;
  if (changePct < 0) return `A tougher stretch ${word}. Be gentle with yourself`;
  return `Steady ${PERIOD_WORD[range]}`;
}

const VARIABILITY_TEXT = {
  steady: "Your mood has been steady lately.",
  mixed: "Your mood has some ups and downs.",
  variable: "Your mood has been swinging quite a bit lately. Jotting down what changes between good and hard days can help you spot why.",
};

function weekendSentence(p) {
  if (p.difference === null) return "Log a few more weekdays and weekends to see how they compare.";
  if (Math.abs(p.difference) < 0.3) return "Your weekends feel about the same as your weekdays.";
  const amount = Math.abs(p.difference).toFixed(1);
  return p.difference > 0
    ? `Your weekends are about ${amount} points brighter than your weekdays.`
    : `Your weekends are about ${amount} points tougher than your weekdays.`;
}

function PatternsCard({ patterns }) {
  const groups = [
    { label: "Weekdays", ...patterns.weekday },
    { label: "Saturday", ...patterns.saturday },
    { label: "Sunday", ...patterns.sunday },
  ];
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h3>Weekdays vs weekends</h3>
      <p className="card-subtext">Based on your last {patterns.days} days</p>
      <div className="pattern-bars">
        {groups.map((g) => (
          <div className="pattern-col" key={g.label}>
            <div className="pattern-track">
              <div
                className="pattern-fill"
                style={{ height: `${g.avg ? (g.avg / 5) * 100 : 0}%` }}
                title={g.avg ? `${g.avg} average from ${g.count} days` : "No entries yet"}
              />
            </div>
            <strong>{g.avg ? moodFromValue(g.avg).emoji : "–"}</strong>
            <span>{g.label}</span>
          </div>
        ))}
      </div>
      <p className="pattern-note">{weekendSentence(patterns)}</p>
      {patterns.variability && <p className="pattern-note">{VARIABILITY_TEXT[patterns.variability.label]}</p>}
    </div>
  );
}

export default function Trends() {
  const [range, setRange] = useState("week");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, ...
  const today = toISODate();
  const weekOf = range === "week" && weekOffset !== 0 ? addDaysISO(today, weekOffset * 7) : null;
  const trends = useAsync(
    () => api.get(`/trends?range=${range}&today=${today}${weekOf ? `&weekOf=${weekOf}` : ""}`),
    [range, today, weekOf]
  );
  const screenings = useAsync(() => api.get("/screenings"), []);

  const t = trends.data;
  const bars = t?.bars ?? [];
  const peak = bars.reduce((best, b, i) => (b.value > (bars[best]?.value ?? 0) ? i : best), -1);
  const avgMood = t?.avgMood ? moodFromValue(t.avgMood) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Wellness Trends</h1>
          <p>Track your path to mental clarity</p>
        </div>
      </div>

      <div className="segmented">
        {["week", "month", "year"].map((r) => (
          <button
            key={r}
            className={range === r ? "active" : ""}
            onClick={() => {
              setRange(r);
              setWeekOffset(0);
            }}
          >
            {r[0].toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {trends.error && <p className="form-error" role="alert">{trends.error.message}</p>}

      <div className="card">
        <div className="card-head-row">
          <h3>Mood Stability</h3>
          {t?.changePct != null && (
            <span className="pill-stat">{t.changePct > 0 ? "+" : ""}{t.changePct}%</span>
          )}
        </div>
        <p className="card-subtext">
          {t ? subtitle(range, t.changePct, t.loggedDays, weekOffset !== 0 && range === "week" ? "that week" : undefined) : "Loading..."}
        </p>

        {range === "week" && (
          <div className="week-nav">
            <button className="icon-btn" onClick={() => setWeekOffset((o) => o - 1)} aria-label="Previous week">
              <IconArrowLeft />
            </button>
            <span className="week-nav-label">
              <strong>{weekOffset === 0 ? "This week" : weekOffset === -1 ? "Last week" : `${-weekOffset} weeks ago`}</strong>
              {t?.week && <small>{formatShortDate(t.week.start)} – {formatShortDate(t.week.end)}</small>}
            </span>
            <button
              className="icon-btn"
              onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
              disabled={weekOffset === 0}
              aria-label="Next week"
            >
              <IconArrowRight />
            </button>
          </div>
        )}
        <div className="bars-chart">
          {bars.map((d, i) => (
            <div className="bar-col" key={d.label}>
              <div
                className={"bar" + (i === peak && d.value > 0 ? " bar--peak" : "")}
                style={{ height: `${Math.max((d.value / 5) * 100, d.value ? 8 : 4)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="bar-labels">
          {bars.map((d) => (
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
          <h4>{t?.streak ?? 0} {t?.streak === 1 ? "Day" : "Days"}</h4>
          <p>Active Streak</p>
        </div>
        <div className="stat-tile">
          <div className="stat-dot" style={{ background: "var(--accent-peach)" }} />
          <h4>{t?.topTrigger ? `💼 ${t.topTrigger}` : "—"}</h4>
          <p>Top Trigger</p>
        </div>
      </div>

      {t?.patterns && <PatternsCard patterns={t.patterns} />}

      <h2 className="section-title">Clinical Screenings</h2>
      {screenings.error && <p className="form-error" role="alert">{screenings.error.message}</p>}
      {!screenings.loading && (screenings.data?.screenings ?? []).length === 0 && (
        <p className="empty-state">
          No screenings yet. <Link to="/screening/phq9" className="link-btn">Take your first PHQ-9</Link>
        </p>
      )}
      <div className="scroll-row">
        {(screenings.data?.screenings ?? []).map((s) => (
          <Link
            to={`/screening/${s.type === "PHQ-9" ? "phq9" : "gad7"}`}
            className="screening-card"
            key={s.id}
          >
            <p className="date">{formatShortDate(s.createdAt)}</p>
            <h4>{s.type} {s.type === "PHQ-9" ? "Depression" : "Anxiety"}</h4>
            <span className="score-pill">Score: {s.score}/{s.max}</span>
            <p className="severity">{s.severity}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
