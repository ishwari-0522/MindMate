import { useState } from "react";
import { api } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import ExerciseModal from "../components/GuidedExercise.jsx";
import { IconPlay, IconWave } from "../components/Icons.jsx";

export default function Coping() {
  const [active, setActive] = useState(null);
  const { data, error, loading } = useAsync(() => api.get("/coping/exercises"), []);

  const exercises = data?.exercises ?? [];
  const featured = exercises.filter((e) => e.featured);
  const explore = exercises.filter((e) => !e.featured);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Coping Space</h1>
          <p>Tools designed to lower nervous system stress</p>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error.message}</p>}
      {loading && !data && <p className="empty-state">Loading exercises...</p>}

      {featured.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 0 }}>Recommended for you</h2>
          <div className="scroll-row">
            {featured.map((ex) => (
              <button
                key={ex.id}
                className={`feature-card feature-card--${ex.accent === "peach" ? "peach" : "purple"}`}
                onClick={() => setActive(ex)}
              >
                {ex.tag && <span className="feature-tag">{ex.tag}</span>}
                <h4>{ex.title}</h4>
                <p>{ex.summary}</p>
                <div className="feature-foot">
                  {ex.minutes} Mins
                  <span className="play-btn"><IconPlay /></span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {explore.length > 0 && (
        <>
          <h2 className="section-title">Explore Exercises</h2>
          <div className="exercise-grid">
            {explore.map((ex) => (
              <button className="exercise-card" key={ex.id} onClick={() => setActive(ex)}>
                <div className="exercise-card-top">
                  <div className={`exercise-icon exercise-icon--${ex.accent}`}>
                    <IconWave />
                  </div>
                  <span className="duration-badge">{ex.minutes} Min</span>
                </div>
                <h4>{ex.title}</h4>
                <p>{ex.summary}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {active && <ExerciseModal exercise={active} onClose={() => setActive(null)} />}
    </div>
  );
}
