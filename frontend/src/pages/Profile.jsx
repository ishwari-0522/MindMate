import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { api, errorMessage } from "../api/client.js";
import { IconShieldCheck, IconDownload, IconTrash } from "../components/Icons.jsx";

const NOTIF_ROWS = [
  { key: "dailyCheckin", label: "Daily Check-in Reminder" },
  { key: "weeklySummary", label: "Weekly Wellness Summary" },
  { key: "aiTips", label: "AI Companion Smart Tips" },
];

export default function Profile() {
  const { user, updateNotification, signOut, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const attempt = async (action) => {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () =>
    attempt(async () => {
      const blob = await api.blob("/me/export");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mindmate-clinical-records.json";
      a.click();
      URL.revokeObjectURL(url);
    });

  const handleDelete = () =>
    attempt(async () => {
      await deleteAccount();
      navigate("/");
    });

  const handleSignOut = () =>
    attempt(async () => {
      await signOut();
      navigate("/");
    });

  return (
    <div>
      <div className="profile-header">
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 20 }}>{user.initials}</div>
        <div>
          <h2>{user.firstName}</h2>
          <p>{user.email}</p>
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
              className={"toggle" + (user.notifications[row.key] ? " toggle--on" : "")}
              onClick={() =>
                updateNotification(row.key, !user.notifications[row.key]).catch((err) => setError(errorMessage(err)))
              }
              aria-label={row.label}
              aria-pressed={user.notifications[row.key]}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Data &amp; Privacy</h2>
      <div className="settings-list">
        <button className="settings-row settings-row--link" onClick={handleExport} disabled={busy}>
          Export Clinical Records
          <IconDownload />
        </button>
        <button
          className="settings-row settings-row--link settings-row--danger"
          onClick={() => setConfirmDelete(true)}
        >
          Delete Private Account
          <IconTrash />
        </button>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={() => setConfirmDelete(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>Delete your account?</h2>
            <p className="card-subtext">
              This permanently erases your account, mood history, journal entries, chats, screenings and bookings.
              This cannot be undone.
            </p>
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ background: "var(--danger)", boxShadow: "none" }}
                disabled={busy}
                onClick={handleDelete}
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="signout-link" onClick={handleSignOut} disabled={busy}>Sign Out of MindMate</button>
    </div>
  );
}
