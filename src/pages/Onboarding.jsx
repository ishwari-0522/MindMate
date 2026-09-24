import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconHeart, IconWave, IconShieldCheck } from "../components/Icons.jsx";

const SLIDES = [
  {
    icon: <IconHeart width={30} height={30} />,
    title: "Your safe space for mental wellness",
    body: "MindMate helps you understand your emotions, track your patterns, and access compassionate clinical support.",
    rings: ["var(--primary-soft)", "var(--accent-peach)", "var(--accent-blue)"],
  },
  {
    icon: <IconWave width={30} height={30} />,
    title: "Understand your patterns",
    body: "Log your mood in seconds and watch gentle trends emerge — sleep, stress, and energy, all in one calm view.",
    rings: ["var(--primary-soft)", "var(--mood-great-bg)", "var(--accent-blue)"],
  },
  {
    icon: <IconShieldCheck width={30} height={30} />,
    title: "Private, secure, and clinically backed",
    body: "Everything you share is encrypted end-to-end. When you're ready, connect with real, licensed clinicians.",
    rings: ["var(--primary-soft)", "var(--mood-low-bg)", "var(--mood-okay-bg)"],
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleContinue = () => {
    if (isLast) navigate("/signup");
    else setStep((s) => s + 1);
  };

  return (
    <div className="onboard">
      <div className="onboard__art-wrap">
        <div className="rings">
          <div className="ring" style={{ width: 260, height: 260, background: slide.rings[0] }} />
          <div className="ring" style={{ width: 190, height: 190, background: slide.rings[1] }} />
          <div className="ring" style={{ width: 128, height: 128, background: slide.rings[2] }} />
          <div className="ring" style={{ width: 72, height: 72, background: "#fff", boxShadow: "var(--shadow)", color: "var(--text)" }}>
            {slide.icon}
          </div>
        </div>
      </div>

      <div className="onboard__body">
        <h1>{slide.title}</h1>
        <p>{slide.body}</p>
      </div>

      <div className="onboard__footer">
        <div className="dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={"dot" + (i === step ? " dot--active" : "")}
              onClick={() => setStep(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="btn btn-primary" onClick={handleContinue}>
          {isLast ? "Get Started" : "Continue"}
        </button>
      </div>
    </div>
  );
}
