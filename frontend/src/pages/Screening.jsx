import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp, fmt } from "../context/AppContext.jsx";
import { IconCheck } from "../components/Icons.jsx";

const OPTIONS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

const BANKS = {
  phq9: {
    label: "PHQ-9",
    title: "Depression",
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
    ranges: [
      [0, 4, "Minimal"],
      [5, 9, "Mild"],
      [10, 14, "Moderate"],
      [15, 19, "Moderately severe"],
      [20, 27, "Severe"],
    ],
    sensitiveIndex: 8,
  },
  gad7: {
    label: "GAD-7",
    title: "Anxiety",
    questions: [
      "Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?",
      "Over the past 2 weeks, how often have you been unable to stop or control worrying?",
      "Over the past 2 weeks, how often have you worried too much about different things?",
      "Over the past 2 weeks, how often have you had trouble relaxing?",
      "Over the past 2 weeks, how often have you been so restless that it's hard to sit still?",
      "Over the past 2 weeks, how often have you become easily annoyed or irritable?",
      "Over the past 2 weeks, how often have you felt afraid, as if something awful might happen?",
    ],
    ranges: [
      [0, 4, "Minimal"],
      [5, 9, "Mild"],
      [10, 14, "Moderate"],
      [15, 21, "Severe"],
    ],
    sensitiveIndex: -1,
  },
};

function severityFor(bank, score) {
  const found = bank.ranges.find(([lo, hi]) => score >= lo && score <= hi);
  return found ? found[2] : "—";
}

export default function Screening() {
  const { type } = useParams();
  const bank = BANKS[type] ?? BANKS.phq9;
  const navigate = useNavigate();
  const { addScreening } = useApp();

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(bank.questions.length).fill(null));
  const [done, setDone] = useState(false);

  const total = bank.questions.length;
  const pct = Math.round(((index + 1) / total) * 100);

  const score = useMemo(() => answers.reduce((sum, a) => sum + (a ?? 0), 0), [answers]);

  const flagged = bank.sensitiveIndex >= 0 && (answers[bank.sensitiveIndex] ?? 0) > 0;

  const selectAnswer = (val) => {
    setAnswers((a) => {
      const next = [...a];
      next[index] = val;
      return next;
    });
  };

  const handleNext = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      const max = bank.ranges[bank.ranges.length - 1][1];
      addScreening({
        type: bank.label,
        date: fmt(new Date()).slice(5).replace("-", "/"),
        score,
        max,
        label: severityFor(bank, score),
      });
      setDone(true);
    }
  };

  const handleBack = () => {
    if (index === 0) navigate(-1);
    else setIndex((i) => i - 1);
  };

  if (done) {
    const max = bank.ranges[bank.ranges.length - 1][1];
    const label = severityFor(bank, score);
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
        <div style={{ flex: 1 }}>
          <div className="result-badge">✓</div>
          <div className="result-score">{score} / {max}</div>
          <p className="result-label">{bank.label} — {label}</p>

          {flagged && (
            <div className="safety-note">
              It looks like you've been having some heavy thoughts. You don't have to carry this alone —
              please consider reaching out to a crisis line or someone you trust right now. In the US, you can
              call or text <strong>988</strong> anytime.
            </div>
          )}

          <div className="card">
            <h3>What this means</h3>
            <p className="card-subtext" style={{ marginBottom: 0 }}>
              This screening is a gentle check-in, not a diagnosis. Your result has been saved to your
              Wellness Trends so you and your clinician can track it over time.
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

  const question = bank.questions[index];
  const answer = answers[index];

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

        <h2 className="screening-question">{question}</h2>

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
      </div>

      <div className="screening-footer btn-row">
        <button className="btn btn-secondary" onClick={handleBack}>Back</button>
        <button className="btn btn-primary" onClick={handleNext} disabled={answer === null}>
          {index === total - 1 ? "See Results" : "Next Question"}
        </button>
      </div>
    </div>
  );
}
