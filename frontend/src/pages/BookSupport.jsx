import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

const CATEGORIES = ["Anxiety", "Depression", "Stress", "Grief"];

const CLINICIANS = [
  { id: "elena", name: "Dr. Elena Rostova", specialty: "Anxiety & Somatic Trauma", tags: ["Anxiety", "Stress"], rating: 4.9, reviews: "1.2k", initials: "E", color: "var(--accent-blue)", nextSlot: "Today, 3:00 PM" },
  { id: "marcus", name: "Marcus Vance, LCSW", specialty: "Mindfulness & Stress Management", tags: ["Stress", "Depression"], rating: 4.8, reviews: "940", initials: "M", color: "var(--accent-peach)", nextSlot: "Tomorrow, 10:00 AM" },
  { id: "priya", name: "Dr. Priya Nair", specialty: "Grief & Life Transitions", tags: ["Grief", "Depression"], rating: 4.9, reviews: "760", initials: "P", color: "var(--mood-low-bg)", nextSlot: "Tomorrow, 1:00 PM" },
];

const SLOTS = ["9:00 AM", "10:30 AM", "1:00 PM", "3:30 PM"];

export default function BookSupport() {
  const { setBooking, state } = useApp();
  const [category, setCategory] = useState("Anxiety");
  const [clinicianId, setClinicianId] = useState("elena");
  const [slot, setSlot] = useState("1:00 PM");
  const [confirmed, setConfirmed] = useState(Boolean(state.booking));

  const filtered = CLINICIANS.filter((c) => c.tags.includes(category));
  const clinician = CLINICIANS.find((c) => c.id === clinicianId) ?? filtered[0];

  const handleBook = () => {
    setBooking({ clinicianId: clinician.id, clinicianName: clinician.name, slot, category });
    setConfirmed(true);
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
              setConfirmed(false);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <h2 className="section-title" style={{ marginTop: 0 }}>Available Clinicians</h2>
      <div className="stack">
        {filtered.map((c) => (
          <button
            key={c.id}
            className={"clinician-card" + (clinicianId === c.id ? " clinician-card--active" : "")}
            onClick={() => {
              setClinicianId(c.id);
              setConfirmed(false);
            }}
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
              <strong>{c.rating}</strong> ({c.reviews})
              <span style={{ marginLeft: "auto" }}>Next slot: <strong>{c.nextSlot}</strong></span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="empty-state">No clinicians listed for this category yet.</p>
        )}
      </div>

      {clinician && (
        <>
          <h2 className="section-title">Select Time Slot</h2>
          <div className="slot-grid">
            {SLOTS.map((s) => (
              <button
                key={s}
                className={"slot-btn" + (slot === s ? " slot-btn--active" : "")}
                onClick={() => {
                  setSlot(s);
                  setConfirmed(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {confirmed ? (
            <div className="confirm-banner">
              ✓ Session booked with {clinician.name} at {slot}. A confidential link will be sent to your email.
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleBook}>
              Book Confidential Session
            </button>
          )}
        </>
      )}
    </div>
  );
}
