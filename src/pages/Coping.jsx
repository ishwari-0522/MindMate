import { useEffect, useRef, useState } from "react";
import { IconPlay, IconClose, IconWave } from "../components/Icons.jsx";

const EXERCISES = [
  {
    id: "box-breathing",
    icon: "blue",
    duration: 5,
    title: "Box Breathing",
    desc: "Settle your central nervous system with a steady 4-4-4-4 rhythm.",
    breathing: true,
  },
  {
    id: "gratitude-journal",
    icon: "peach",
    duration: 8,
    title: "Gratitude Journal",
    desc: "A curated prompt to ground your positive outlook.",
    breathing: false,
    prompt: "Write down three small things that felt good today, no matter how tiny.",
  },
  {
    id: "guided-reflection",
    icon: "green",
    duration: 12,
    title: "Guided Reflection",
    desc: "A mindful check-in with your thoughts and feelings, no judgment.",
    breathing: false,
    prompt: "Notice what you're feeling right now, and name it without trying to change it.",
  },
  {
    id: "somatic-shaking",
    icon: "purple",
    duration: 10,
    title: "Somatic Shaking",
    desc: "Release cortisol buildup by gently shaking out tension.",
    breathing: false,
    prompt: "Stand up, relax your shoulders, and let your hands and arms shake loosely for a minute.",
  },
];

export default function Coping() {
  const [active, setActive] = useState(null);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Coping Space</h1>
          <p>Tools designed to lower nervous system stress</p>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: 0 }}>Recommended for you</h2>
      <div className="scroll-row">
        <button
          className="feature-card feature-card--purple"
          onClick={() => setActive({ id: "vagus", title: "Vagus Nerve Stimulation", duration: 15, breathing: true, desc: "Gently calm your racing thoughts with auditory somatic beats." })}
        >
          <span className="feature-tag">CLINICAL CHOICE</span>
          <h4>Vagus Nerve Stimulation</h4>
          <p>Gently calm your racing thoughts with auditory somatic beats.</p>
          <div className="feature-foot">
            15 Mins
            <span className="play-btn"><IconPlay /></span>
          </div>
        </button>

        <button
          className="feature-card feature-card--peach"
          onClick={() => setActive({ id: "warmth", title: "Warmth Reset", duration: 8, breathing: false, desc: "A multi-sensory prompt series for tactile relief.", prompt: "Hold something warm — a mug, a blanket, your own palms pressed together — and notice the sensation for a slow minute." })}
        >
          <span className="feature-tag">SOOTHING</span>
          <h4>Warmth Reset</h4>
          <p>A multi-sensory prompt series for tactile relief.</p>
          <div className="feature-foot">
            8 Mins
            <span className="play-btn"><IconPlay /></span>
          </div>
        </button>
      </div>

      <h2 className="section-title">Explore Exercises</h2>
      <div className="exercise-grid">
        {EXERCISES.map((ex) => (
          <button className="exercise-card" key={ex.id} onClick={() => setActive(ex)}>
            <div className="exercise-card-top">
              <div className={`exercise-icon exercise-icon--${ex.icon}`}>
                <IconWave />
              </div>
              <span className="duration-badge">{ex.duration} Min</span>
            </div>
            <h4>{ex.title}</h4>
            <p>{ex.desc}</p>
          </button>
        ))}
      </div>

      {active && <ExerciseModal exercise={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function ExerciseModal({ exercise, onClose }) {
  const [seconds, setSeconds] = useState(exercise.duration * 60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("in");
  const intervalRef = useRef(null);
  const phaseRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (running && exercise.breathing) {
      phaseRef.current = setInterval(() => {
        setPhase((p) => (p === "in" ? "out" : "in"));
      }, 3600);
    }
    return () => clearInterval(phaseRef.current);
  }, [running, exercise.breathing]);

  useEffect(() => {
    if (seconds === 0) {
      setRunning(false);
    }
  }, [seconds]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h2>{exercise.title}</h2>
          <button className="close-x" onClick={onClose}><IconClose /></button>
        </div>

        {exercise.breathing ? (
          <div className="breathing-circle-wrap">
            <div className={"breathing-circle" + (phase === "in" ? " breathing-circle--in" : "")}>
              {running ? (phase === "in" ? "Breathe in" : "Breathe out") : "Ready"}
            </div>
          </div>
        ) : (
          <p className="card-subtext">{exercise.prompt ?? exercise.desc}</p>
        )}

        <div className="timer-display">{mm}:{ss}</div>

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => setSeconds(exercise.duration * 60)}>
            Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setRunning((r) => !r)}
            disabled={seconds === 0}
          >
            {seconds === 0 ? "Complete" : running ? "Pause" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
