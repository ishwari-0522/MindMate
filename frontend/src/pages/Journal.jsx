import { useMemo, useState } from "react";
import { useApp, MOODS, fmt } from "../context/AppContext.jsx";
import { IconArrowLeft, IconArrowRight, IconPlus, IconPencil, IconClose } from "../components/Icons.jsx";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const TAG_OPTIONS = ["Sleep", "Health", "Work", "Relationships", "Stress", "Self-care"];

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function moodEmoji(mood) {
  return MOODS.find((m) => m.key === mood)?.emoji ?? "🙂";
}

function displayDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Journal() {
  const { state, addJournalEntry, logMood } = useApp();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [modalDate, setModalDate] = useState(null);

  const cells = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const todayKey = fmt(today);

  const moodByDate = useMemo(() => {
    const map = {};
    state.moodEntries.forEach((m) => (map[m.date] = m.mood));
    return map;
  }, [state.moodEntries]);

  const changeMonth = (delta) => {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Your Mood Map</h1>
          <p>A reflection of your emotional path.</p>
        </div>
        <button className="pill-btn" onClick={() => setModalDate(todayKey)}>
          <IconPlus width={16} height={16} /> Entry
        </button>
      </div>

      <div className="card">
        <div className="calendar-nav">
          <h3>{MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="icon-btn" onClick={() => changeMonth(-1)} aria-label="Previous month"><IconArrowLeft /></button>
            <button className="icon-btn" onClick={() => changeMonth(1)} aria-label="Next month"><IconArrowRight /></button>
          </div>
        </div>

        <div className="cal-grid">
          {DOW.map((d, i) => (
            <div className="cal-dow" key={i}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div className="cal-cell cal-cell--empty" key={i} />;
            const key = fmt(new Date(cursor.getFullYear(), cursor.getMonth(), day));
            const mood = moodByDate[key];
            return (
              <button
                key={i}
                className={
                  "cal-cell" +
                  (mood ? ` cal-cell--filled mood-${mood}` : "") +
                  (key === todayKey ? " cal-cell--today" : "")
                }
                onClick={() => setModalDate(key)}
                title={key}
              />
            );
          })}
        </div>
      </div>

      <h2 className="section-title">Recent Insights</h2>
      {state.journalEntries.length === 0 && (
        <p className="empty-state">No entries yet. Tap + Entry to write your first reflection.</p>
      )}
      <div className="stack">
        {state.journalEntries.map((entry) => (
          <div className="card insight-card" key={entry.id}>
            <div className="card-head-row">
              <div className="insight-meta">
                <span className={`insight-emoji mood-${entry.mood}`}>{moodEmoji(entry.mood)}</span>
                {displayDate(entry.date)} · {entry.period}
              </div>
              <button className="edit-btn" onClick={() => setModalDate(entry.date)} aria-label="Edit entry">
                <IconPencil />
              </button>
            </div>
            <p className="insight-text">{entry.text}</p>
            <div className="tag-row">
              {entry.tags.map((t) => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modalDate && (
        <EntryModal
          date={modalDate}
          existingMood={moodByDate[modalDate]}
          onClose={() => setModalDate(null)}
          onSave={(payload) => {
            logMood(payload.mood, modalDate);
            addJournalEntry({
              date: modalDate,
              period: payload.period,
              mood: payload.mood,
              text: payload.text,
              tags: payload.tags,
            });
            setModalDate(null);
          }}
        />
      )}
    </div>
  );
}

function EntryModal({ date, existingMood, onClose, onSave }) {
  const [mood, setMood] = useState(existingMood ?? "good");
  const [text, setText] = useState("");
  const [tags, setTags] = useState([]);
  const [period, setPeriod] = useState("Evening entry");

  const toggleTag = (t) => {
    setTags((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h2>New Entry · {displayDate(date)}</h2>
          <button className="close-x" onClick={onClose}><IconClose /></button>
        </div>

        <div className="field">
          <label>How did this moment feel?</label>
          <div className="mood-picker">
            {MOODS.map((m) => (
              <button
                key={m.key}
                className={`mood-option mood-${m.key}` + (mood === m.key ? " mood-option--active" : "")}
                onClick={() => setMood(m.key)}
                type="button"
              >
                <span className="mood-emoji">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>When was this?</label>
          <div className="chip-select">
            {["Morning entry", "Afternoon entry", "Evening entry"].map((p) => (
              <button
                key={p}
                type="button"
                className={"chip" + (period === p ? " chip--active" : "")}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>What's on your mind?</label>
          <textarea
            className="textarea"
            placeholder="Write a few honest lines..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Tags</label>
          <div className="chip-select">
            {TAG_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                className={"chip" + (tags.includes(t) ? " chip--active" : "")}
                onClick={() => toggleTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={!text.trim()}
          onClick={() => onSave({ mood, text: text.trim(), tags, period })}
        >
          Save Entry
        </button>
      </div>
    </div>
  );
}
