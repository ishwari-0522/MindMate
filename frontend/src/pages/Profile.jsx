import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import {
  IconShieldCheck,
  IconDownload,
  IconTrash,
} from "../components/Icons.jsx";
import { useState } from "react";

const NOTIF_ROWS = [
  { key: "dailyCheckin", label: "Daily Check-in Reminder" },
  { key: "weeklySummary", label: "Weekly Wellness Summary" },
  { key: "aiTips", label: "AI Companion Smart Tips" },
];

export default function Profile() {
  const { state, setNotification, signOut, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mindmate-clinical-records.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    deleteAccount();
    navigate("/");
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div>
      <div className="profile-header">
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>
          {state.user.initials || "U"}
        </div>
        <div>
          <h2>{state.user.firstName ? `${state.user.firstName} Sharma` : "Your Name"}</h2>
          <p>{state.user.email || "you@mindmate.co"}</p>
        </div>
      </div>

      <div className="info-banner">
        <div className="info-banner-icon"><IconShieldCheck /></div>
        <span>Your clinical data is 100% encrypted, stored securely, and fully HIPAA-compliant.</span>
      </div>

      <h2 className="section-title" style={{ marginTop: 0 }}>Notifications</h2>
      <div className="settings-list">
        {NOTIF_ROWS.map((row) => (
          <div className="settings-row" key={row.key}>
            {row.label}
            <button
              className={"toggle" + (state.notifications[row.key] ? " toggle--on" : "")}
              onClick={() => setNotification(row.key, !state.notifications[row.key])}
              aria-label={row.label}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Data &amp; Privacy</h2>
      <div className="settings-list">
        <button className="settings-row settings-row--link" onClick={handleExport}>
          Export Clinical Records
          <IconDownload />
        </button>
        <button className="settings-row settings-row--link settings-row--danger" onClick={() => setConfirmDelete(true)}>
          Delete Private Account
          <IconTrash />
        </button>
      </div>

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>Delete your account?</h2>
            <p className="card-subtext">
              This permanently erases your mood history, journal entries, and screenings from this device.
              This cannot be undone.
            </p>
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background: "var(--danger)", boxShadow: "none" }} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="signout-link" onClick={handleSignOut}>Sign Out of MindMate</button>
    </div>
  );
}
