import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "../api/client.js";
import { IconCheck } from "../components/Icons.jsx";
import { HelplineList, ResourceCard } from "../components/SupportLists.jsx";
import { toISODate } from "../lib/dates.js";

const OPTIONS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

const BANKS = {
  phq9: {
    label: "PHQ-9",
    questions: [
      "Over the past 2 weeks, how often have you had little interest or pleasure in doing things?",
      "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
      "Over the past 2 weeks, how often have you had trouble falling asleep, staying asleep, or sleeping too much?",
      "Over the past 2 weeks, how often have you felt tired or had little energy?",
      "Over the past 2 weeks, how often have you had poor appetite or found yourself overeating?",
      "Over the past 2 weeks, how often have you felt bad about yourself, or that you're a failure, or that you've let yourself or your family down?",
      "Over the past 2 weeks, how often have you had trouble concentrating on things like reading or watching TV?",
      "Over the past 2 weeks, how often have others noticed you moving or speaking unusually slowly, or being fidgety and restless?",
      "Over the past 2 weeks, how often have you had thoughts that you'd be better off dead, or of hurting yourself?",
    ],
  },
  gad7: {
    label: "GAD-7",
    questions: [
      "Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?",
      "Over the past 2 weeks, how often have you been unable to stop or control worrying?",
      "Over the past 2 weeks, how often have you worried too much about different things?",
      "Over the past 2 weeks, how often have you had trouble relaxing?",
      "Over the past 2 weeks, how often have you been so restless that it's hard to sit still?",
      "Over the past 2 weeks, how often have you become easily annoyed or irritable?",
      "Over the past 2 weeks, how often have you felt afraid, as if something awful might happen?",
    ],
  },
};

export default function Screening() {
  const { type } = useParams();
  const key = BANKS[type] ? type : "phq9";
  const bank = BANKS[key];
  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(bank.questions.length).fill(null));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = bank.questions.length;
  const pct = Math.round(((index + 1) / total) * 100);
  const answer = answers[index];

  const selectAnswer = (val) =>
    setAnswers((a) => {
      const next = [...a];
      next[index] = val;
      return next;
    });

  const handleNext = async () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // The server scores the answers and returns the result; it is the source of truth.
      const res = await api.post("/screenings", { type: key, answers, today: toISODate() });
      setResult(res);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (index === 0) navigate(-1);
    else setIndex((i) => i - 1);
  };

  if (result) {
    const { screening, support } = result;
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ flex: 1 }}>
          <div className="result-badge">✓</div>
          <div className="result-score">{screening.score} / {screening.max}</div>
          <p className="result-label">{screening.type} · {screening.severity}</p>

          {support.helplines.length > 0 && (
            <div className="safety-note">
              <strong>{support.headline}</strong>
              <p style={{ margin: "6px 0 14px" }}>{support.message}</p>
              <HelplineList helplines={support.helplines} />
            </div>
          )}

          {support.helplines.length === 0 && support.platforms.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3>{support.headline}</h3>
              <p className="card-subtext">{support.message}</p>
              <div className="stack">
                {support.platforms.map((p) => (
                  <ResourceCard key={p.id} item={p} actionLabel="Visit" />
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3>What this means</h3>
            <p className="card-subtext" style={{ marginBottom: 0 }}>
              This screening is a gentle check-in, not a diagnosis. Your result has been saved to your Wellness
              Trends so you and your clinician can track it over time.
            </p>
          </div>
        </div>

        <div className="screening-footer">
          <button className="btn btn-primary" onClick={() => navigate("/trends")}>
            View My Trends
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ flex: 1 }}>
        <div className="screening-top">
          <span>Question {index + 1} of {total}</span>
          <span>{pct}% Complete</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <h2 className="screening-question">{bank.questions[index]}</h2>

        <div className="option-list">
          {OPTIONS.map((opt, i) => (
            <button
              key={opt}
              className={"option-btn" + (answer === i ? " option-btn--active" : "")}
              onClick={() => selectAnswer(i)}
            >
              {opt}
              {answer === i && <IconCheck />}
            </button>
          ))}
        </div>
        {error && <p className="form-error" role="alert" style={{ marginTop: 16 }}>{error}</p>}
      </div>

      <div className="screening-footer btn-row">
        <button className="btn btn-secondary" onClick={handleBack} disabled={submitting}>Back</button>
        <button className="btn btn-primary" onClick={handleNext} disabled={answer === null || submitting}>
          {submitting ? "Saving..." : index === total - 1 ? "See Results" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
