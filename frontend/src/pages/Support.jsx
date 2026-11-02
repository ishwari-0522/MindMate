import { useState } from "react";
import { api, errorMessage } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import { toISODate } from "../lib/dates.js";
import { HelplineList, ResourceCard } from "../components/SupportLists.jsx";

export default function Support() {
  const today = toISODate();
  const { data: g, error, loading } = useAsync(() => api.get(`/support/guidance?today=${today}`), [today]);
  const [asked, setAsked] = useState({ helplines: null, error: "", busy: false });

  const showHelplines = async () => {
    setAsked({ helplines: null, error: "", busy: true });
    try {
      const res = await api.get("/support/helplines");
      setAsked({ helplines: res.helplines, error: "", busy: false });
    } catch (err) {
      setAsked({ helplines: null, error: errorMessage(err), busy: false });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Support &amp; Resources</h1>
          <p>Ideas, places and people to help you feel a little better</p>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error.message}</p>}
      {loading && !g && <p className="empty-state">Loading...</p>}

      {g && (
        <>
          <div className={`card support-banner support-banner--l${g.level}`}>
            <h3>{g.headline}</h3>
            <p className="card-subtext" style={{ marginBottom: g.reasons.length ? 12 : 0 }}>{g.message}</p>
            {g.reasons.length > 0 && (
              <div className="support-reasons">
                <span>Why you're seeing this</span>
                <ul>
                  {g.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {g.helplines.length > 0 && (
            <>
              <h2 className="section-title">Talk to someone now</h2>
              <p className="card-subtext">These are free and confidential. Calling is a strong, good step.</p>
              <HelplineList helplines={g.helplines} />
            </>
          )}

          {g.platforms.length > 0 && (
            <>
              <h2 className="section-title">Find someone to talk to</h2>
              <p className="card-subtext">
                Websites where you can find and book registered professionals. You choose who feels right.
              </p>
              <div className="stack">
                {g.platforms.map((p) => (
                  <ResourceCard key={p.id} item={p} actionLabel="Visit" />
                ))}
              </div>
            </>
          )}

          <h2 className="section-title">Things to try today</h2>
          <div className="stack">
            {[...g.suggestions.activities, ...g.suggestions.advice].map((s) => (
              <ResourceCard key={s.id} item={s} actionLabel="Open" />
            ))}
          </div>

          <h2 className="section-title">Places to go</h2>
          <p className="card-subtext">Getting out of the house, even briefly, helps. Tap to find one near you.</p>
          <div className="stack">
            {g.suggestions.places.map((p) => (
              <ResourceCard key={p.id} item={p} actionLabel="Find near me" />
            ))}
          </div>

          {g.helplines.length === 0 && (
            <div className="support-ask">
              {asked.helplines ? (
                <>
                  <h2 className="section-title">Helplines</h2>
                  <HelplineList helplines={asked.helplines} />
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={showHelplines} disabled={asked.busy}>
                    {asked.busy ? "Loading..." : "Need to talk to someone right now?"}
                  </button>
                  {asked.error && <p className="form-error" role="alert">{asked.error}</p>}
                </>
              )}
            </div>
          )}

          <p className="support-disclaimer">
            MindMate offers general wellbeing support and isn't a substitute for professional care. If you are in
            immediate danger, call your local emergency number.
          </p>
        </>
      )}
    </div>
  );
}
