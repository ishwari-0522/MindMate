import { useMemo, useState } from "react";
import { MOODS } from "../context/AppContext.jsx";
import { api, errorMessage } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import { formatShortDate, toISODate } from "../lib/dates.js";
import { IconArrowLeft, IconArrowRight, IconPlus, IconPencil, IconClose } from "../components/Icons.jsx";
import SupportAlert from "../components/SupportAlert.jsx";
import { useSupportAlert } from "../api/useSupportAlert.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const TAG_OPTIONS = ["Fun", "Sleep", "Health", "Work", "Relationships", "Stress", "Self-care"];
const PERIODS = ["Morning entry", "Afternoon entry", "Evening entry"];

function buildMonthGrid(year, month) {
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

const moodEmoji = (mood) => MOODS.find((m) => m.key === mood)?.emoji ?? "🙂";

export default function Journal() {
  const todayKey = toISODate();
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [modal, setModal] = useState(null); // { date, entry? }
  const supportAlert = useSupportAlert();

  const moodsReq = useAsync(() => api.get("/moods"), []);
  const journalReq = useAsync(() => api.get("/journal"), []);

  // The calendar shows the journal text itself, so it needs every entry in the month being displayed.
  const monthFrom = toISODate(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
  const monthTo = toISODate(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0));
  const monthReq = useAsync(() => api.get(`/journal?from=${monthFrom}&to=${monthTo}&limit=200`), [monthFrom, monthTo]);
  const entriesByDate = useMemo(() => {
    const map = {};
    (monthReq.data?.entries ?? []).forEach((e) => {
      (map[e.date] ??= []).push(e); // newest first, as the API returns them
    });
    return map;
  }, [monthReq.data]);

  const cells = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const moodByDate = useMemo(() => {
    const map = {};
    (moodsReq.data?.moods ?? []).forEach((m) => (map[m.date] = m.mood));
    return map;
  }, [moodsReq.data]);
  const entries = journalReq.data?.entries ?? [];

  const changeMonth = (delta) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const handleSave = async (payload) => {
    const body = { date: modal.date, ...payload };
    if (modal.entry) await api.put(`/journal/${modal.entry.id}`, body);
    else await api.post("/journal", body);
    await api.put(`/moods/${modal.date}`, { mood: payload.mood });
    moodsReq.reload();
    journalReq.reload();
    monthReq.reload();
    setModal(null);
    supportAlert.check();
  };

  const handleDelete = async () => {
    await api.del(`/journal/${modal.entry.id}`);
    journalReq.reload();
    monthReq.reload();
    setModal(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Your Mood Map</h1>
          <p>A reflection of your emotional path.</p>
        </div>
        <button className="pill-btn" onClick={() => setModal({ date: todayKey })}>
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
            const key = toISODate(new Date(cursor.getFullYear(), cursor.getMonth(), day));
            const mood = moodByDate[key];
            const dayEntries = entriesByDate[key] ?? [];
            const latest = dayEntries[0];
            return (
              <button
                key={i}
                className={
                  "cal-cell" +
                  (mood ? ` cal-cell--filled mood-${mood}` : "") +
                  (key === todayKey ? " cal-cell--today" : "")
                }
                onClick={() => setModal({ date: key, entry: latest })}
                title={latest ? latest.text || "Edit entry" : `Add entry for ${formatShortDate(key)}`}
                aria-label={latest ? `Edit entry for ${formatShortDate(key)}${latest.text ? `: ${latest.text}` : ""}` : `Add entry for ${formatShortDate(key)}`}
              >
                <span className="cal-day">{day}</span>
                {latest?.text && <span className="cal-note">{latest.text}</span>}
                {dayEntries.length > 1 && <span className="cal-more">+{dayEntries.length - 1}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <h2 className="section-title">Recent Insights</h2>
      {(moodsReq.error || journalReq.error) && (
        <p className="form-error" role="alert">{(moodsReq.error || journalReq.error).message}</p>
      )}
      {!journalReq.loading && entries.length === 0 && (
        <p className="empty-state">No entries yet. Tap + Entry to write your first reflection.</p>
      )}
      <div className="stack">
        {entries.map((entry) => (
          <div className="card insight-card" key={entry.id}>
            <div className="card-head-row">
              <div className="insight-meta">
                <span className={`insight-emoji mood-${entry.mood}`}>{moodEmoji(entry.mood)}</span>
                {formatShortDate(entry.date)} · {entry.period}
              </div>
              <button className="edit-btn" onClick={() => setModal({ date: entry.date, entry })} aria-label="Edit entry">
                <IconPencil />
              </button>
            </div>
            {entry.text && <p className="insight-text">{entry.text}</p>}
            <div className="tag-row">
              {entry.tags.map((t) => (
                <span className="tag" key={t}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <EntryModal
          date={modal.date}
          entry={modal.entry}
          existingMood={moodByDate[modal.date]}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      <SupportAlert guidance={supportAlert.alert} onClose={supportAlert.dismiss} />
    </div>
  );
}

function EntryModal({ date, entry, existingMood, onClose, onSave, onDelete }) {
  const [mood, setMood] = useState(entry?.mood ?? existingMood ?? "good");
  const [text, setText] = useState(entry?.text ?? "");
  const [tags, setTags] = useState(entry?.tags ?? []);
  const [period, setPeriod] = useState(entry?.period ?? "Evening entry");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleTag = (t) => setTags((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h2>{entry ? "Edit Entry" : "New Entry"} · {formatShortDate(date)}</h2>
          <button className="close-x" onClick={onClose} aria-label="Close"><IconClose /></button>
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
            {PERIODS.map((p) => (
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
          <label>What's on your mind? (optional)</label>
          <textarea
            className="textarea"
            placeholder="Write a few honest lines..."
            maxLength={5000}
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

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="btn-row">
          {entry && (
            <button className="btn btn-secondary" disabled={busy} onClick={() => run(onDelete)}>
              Delete
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={busy}
            onClick={() => run(() => onSave({ mood, text: text.trim(), tags, period }))}
          >
            {busy ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
