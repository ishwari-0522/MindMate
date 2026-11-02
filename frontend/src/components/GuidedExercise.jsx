import { useEffect, useMemo, useState } from "react";
import { IconClose } from "./Icons.jsx";

const GET_READY_SECONDS = 4;
const SCALE = { grow: 1.45, shrink: 0.8 };

// Flatten rounds x phases into one list of timed steps, with a short "get ready" at the start.
function buildSequence(exercise) {
  const ready = { label: "Get ready", instruction: "Find a comfortable position", seconds: GET_READY_SECONDS, motion: "none", ready: true };
  const steps = [];
  for (let round = 1; round <= exercise.rounds; round++) {
    exercise.phases.forEach((p, i) => steps.push({ ...p, round, stepInRound: i + 1 }));
  }
  return [ready, ...steps];
}

// The circle keeps its size through "hold" phases and prompts, so look back for the last grow/shrink.
function scaleAt(sequence, index) {
  for (let i = index; i >= 0; i--) {
    const motion = sequence[i].motion;
    if (motion === "grow" || motion === "shrink") return SCALE[motion];
  }
  return 1;
}

export default function ExerciseModal({ exercise, onClose }) {
  const [stage, setStage] = useState("learn"); // learn -> run -> done
  const [runId, setRunId] = useState(0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet modal-sheet--tall" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={exercise.title}>
        <div className="modal-header-row">
          <h2>{exercise.title}</h2>
          <button className="close-x" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {stage === "learn" && <Learn exercise={exercise} onStart={() => setStage("run")} />}
        {stage === "run" && (
          <GuidedRun
            key={runId}
            exercise={exercise}
            onFinish={() => setStage("done")}
            onExit={() => setStage("learn")}
          />
        )}
        {stage === "done" && (
          <div className="guide-done">
            <div className="result-badge">✓</div>
            <p className="guide-closing">{exercise.closing}</p>
            <div className="btn-row">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setRunId((n) => n + 1);
                  setStage("run");
                }}
              >
                Do it again
              </button>
              <button className="btn btn-primary" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Learn({ exercise, onStart }) {
  return (
    <div>
      <p className="guide-intro">{exercise.intro}</p>

      <div className="guide-meta">
        <span>About {exercise.minutes} min</span>
        <span>{exercise.rounds > 1 ? `${exercise.rounds} rounds` : `${exercise.phases.length} steps`}</span>
      </div>

      <h3 className="guide-heading">How to do it</h3>
      <ol className="guide-steps">
        {exercise.steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      {exercise.caution && <p className="guide-caution">{exercise.caution}</p>}

      <button className="btn btn-primary" onClick={onStart}>Start guided session</button>
    </div>
  );
}

function GuidedRun({ exercise, onFinish, onExit }) {
  const sequence = useMemo(() => buildSequence(exercise), [exercise]);
  const [state, setState] = useState({ index: 0, remaining: sequence[0].seconds, running: true, finished: false });

  useEffect(() => {
    if (!state.running) return undefined;
    const timer = setInterval(() => {
      setState((s) => {
        if (s.remaining > 1) return { ...s, remaining: s.remaining - 1 };
        if (s.index + 1 < sequence.length) {
          return { ...s, index: s.index + 1, remaining: sequence[s.index + 1].seconds };
        }
        return { ...s, remaining: 0, running: false, finished: true };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.running, sequence]);

  useEffect(() => {
    if (state.finished) onFinish();
  }, [state.finished, onFinish]);

  const step = sequence[state.index];
  const breathing = exercise.phases.some((p) => p.motion === "grow" || p.motion === "shrink");

  const totalSeconds = sequence.reduce((sum, s) => sum + s.seconds, 0);
  const doneSeconds =
    sequence.slice(0, state.index).reduce((sum, s) => sum + s.seconds, 0) + (step.seconds - state.remaining);
  const progress = Math.min(100, Math.round((doneSeconds / totalSeconds) * 100));

  const position = step.ready
    ? "Starting"
    : exercise.rounds > 1
    ? `Round ${step.round} of ${exercise.rounds}`
    : `Step ${step.stepInRound} of ${exercise.phases.length}`;

  const skip = () =>
    setState((s) =>
      s.index + 1 < sequence.length
        ? { ...s, index: s.index + 1, remaining: sequence[s.index + 1].seconds }
        : { ...s, remaining: 0, running: false, finished: true }
    );

  return (
    <div className="guide-run">
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="guide-position">{position}</p>

      <div className="guide-stage">
        <div
          className={"guide-circle" + (breathing ? " guide-circle--breath" : "")}
          style={
            breathing
              ? { transform: `scale(${scaleAt(sequence, state.index)})`, transitionDuration: `${step.seconds}s` }
              : undefined
          }
        >
          <span className="guide-count">{state.remaining}</span>
        </div>
      </div>

      <div aria-live="polite">
        <h3 className="guide-phase">{step.label}</h3>
        <p className="guide-instruction">{step.instruction}</p>
      </div>

      <div className="btn-row guide-controls">
        <button className="btn btn-secondary" onClick={onExit}>Back</button>
        <button className="btn btn-secondary" onClick={() => setState((s) => ({ ...s, running: !s.running }))}>
          {state.running ? "Pause" : "Resume"}
        </button>
        {!breathing && <button className="btn btn-primary" onClick={skip}>Next</button>}
      </div>
    </div>
  );
}
