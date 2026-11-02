import { useState } from "react";
import { api, errorMessage } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import { addDaysISO, formatShortDate, localNow, toISODate } from "../lib/dates.js";

const CATEGORIES = ["Anxiety", "Depression", "Stress", "Grief"];

function dayLabel(iso, offset) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
}

export default function BookSupport() {
  const today = toISODate();
  const days = [...Array(7)].map((_, i) => ({ iso: addDaysISO(today, i), offset: i }));

  const [category, setCategory] = useState("Anxiety");
  const [clinicianId, setClinicianId] = useState(null);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(null);
  const [notice, setNotice] = useState(null); // { kind: "ok" | "error", text }
  const [busy, setBusy] = useState(false);

  const clinicians = useAsync(() => api.get(`/clinicians?category=${category}&now=${localNow()}`), [category]);
  const list = clinicians.data?.clinicians ?? [];
  const selected = list.find((c) => c.id === clinicianId) ?? list[0];

  const slots = useAsync(
    () => (selected ? api.get(`/clinicians/${selected.id}/slots?date=${date}&now=${localNow()}`) : Promise.resolve({ slots: [] })),
    [selected?.id, date]
  );
  const bookings = useAsync(() => api.get("/bookings"), []);

  const pickClinician = (id) => {
    setClinicianId(id);
    setTime(null);
    setNotice(null);
  };

  const handleBook = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const { booking } = await api.post("/bookings", {
        clinicianId: selected.id,
        date,
        time,
        category,
        now: localNow(),
      });
      setNotice({
        kind: "ok",
        text: `Session booked with ${booking.clinicianName} on ${formatShortDate(booking.date)} at ${booking.label}.`,
      });
      setTime(null);
    } catch (err) {
      setNotice({ kind: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
      slots.reload();
      bookings.reload();
      clinicians.reload();
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.del(`/bookings/${id}`);
      setNotice({ kind: "ok", text: "Your session was cancelled." });
    } catch (err) {
      setNotice({ kind: "error", text: errorMessage(err) });
    }
    bookings.reload();
    slots.reload();
    clinicians.reload();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Book Clinical Support</h1>
          <p>Talk with compassionate, vetted trauma specialists</p>
        </div>
      </div>

      <div className="filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={"filter-chip" + (category === c ? " filter-chip--active" : "")}
            onClick={() => {
              setCategory(c);
              setClinicianId(null);
              setTime(null);
              setNotice(null);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <h2 className="section-title" style={{ marginTop: 0 }}>Available Clinicians</h2>
      {clinicians.error && <p className="form-error" role="alert">{clinicians.error.message}</p>}
      <div className="stack">
        {list.map((c) => (
          <button
            key={c.id}
            className={"clinician-card" + (selected?.id === c.id ? " clinician-card--active" : "")}
            onClick={() => pickClinician(c.id)}
          >
            <div className="clinician-top">
              <div className="avatar" style={{ background: c.color }}>{c.initials}</div>
              <div>
                <h4>{c.name}</h4>
                <p>{c.specialty}</p>
              </div>
            </div>
            <div className="clinician-meta">
              <span className="star">★</span>
              <strong>{c.rating}</strong> ({c.reviewCount})
              <span style={{ marginLeft: "auto" }}>
                Next slot: <strong>{c.nextSlot ? c.nextSlot.label : "None soon"}</strong>
              </span>
            </div>
          </button>
        ))}
        {!clinicians.loading && list.length === 0 && (
          <p className="empty-state">No clinicians listed for this category yet.</p>
        )}
      </div>

      {selected && (
        <>
          <h2 className="section-title">Select Day</h2>
          <div className="filter-row">
            {days.map((d) => (
              <button
                key={d.iso}
                className={"filter-chip" + (date === d.iso ? " filter-chip--active" : "")}
                onClick={() => {
                  setDate(d.iso);
                  setTime(null);
                  setNotice(null);
                }}
              >
                {dayLabel(d.iso, d.offset)}
              </button>
            ))}
          </div>

          <h2 className="section-title" style={{ marginTop: 0 }}>Select Time Slot</h2>
          <div className="slot-grid">
            {(slots.data?.slots ?? []).map((s) => (
              <button
                key={s.time}
                disabled={!s.available}
                className={"slot-btn" + (time === s.time ? " slot-btn--active" : "")}
                onClick={() => {
                  setTime(s.time);
                  setNotice(null);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" disabled={!time || busy} onClick={handleBook}>
            {busy ? "Booking..." : "Book Confidential Session"}
          </button>
        </>
      )}

      {notice && (
        <div className={notice.kind === "ok" ? "confirm-banner" : "form-error"} role="status" style={{ marginTop: 16 }}>
          {notice.text}
        </div>
      )}

      {(bookings.data?.bookings ?? []).length > 0 && (
        <>
          <h2 className="section-title">Your Upcoming Sessions</h2>
          <div className="stack">
            {bookings.data.bookings.map((b) => (
              <div className="card booking-item" key={b.id}>
                <div>
                  <h4>{b.clinicianName}</h4>
                  <p className="card-subtext" style={{ margin: 0 }}>
                    {formatShortDate(b.date)} · {b.label} · {b.category}
                  </p>
                </div>
                <button className="chip" onClick={() => handleCancel(b.id)}>Cancel</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
