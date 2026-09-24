import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { IconArrowLeft, IconInfo, IconSend, IconMic, IconSmile } from "../components/Icons.jsx";

const QUICK_REPLIES = ["Yes, guide me through box breathing", "I just want to talk"];

function craftReply(text) {
  const t = text.toLowerCase();
  if (t.includes("breath")) {
    return "Beautiful. Breathe in for 4 counts, hold for 4, and release for 4. Let's do three rounds together — I'm right here with you.";
  }
  if (t.includes("overwhelm") || t.includes("stress") || t.includes("anxious") || t.includes("anxiety")) {
    return "I hear you, and it's completely okay to feel this way. Let's take a gentle pause together. Would you like to try a simple, 1-minute box breathing cycle?";
  }
  if (t.includes("sad") || t.includes("down") || t.includes("depress") || t.includes("hopeless")) {
    return "Thank you for trusting me with that. Feeling low doesn't mean anything is wrong with you. Would it help to write about it in your journal, or just talk it through here?";
  }
  if (t.includes("sleep") || t.includes("tired") || t.includes("exhaust")) {
    return "Rest matters more than we give it credit for. What does your evening usually look like right before bed?";
  }
  if (t.includes("thank")) {
    return "Always here for you, Asavari. That's what this space is for.";
  }
  if (t.includes("talk")) {
    return "I'm listening. Take your time — there's no rush and no judgment here.";
  }
  return "I hear you. Tell me a little more about what's going on, and we'll work through it together, one gentle step at a time.";
}

export default function Chat() {
  const { state, sendChatMessage, addBotMessage } = useApp();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.chatMessages, typing]);

  const handleSend = (text) => {
    const value = text.trim();
    if (!value) return;
    sendChatMessage(value);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addBotMessage(craftReply(value));
    }, 1000 + Math.random() * 500);
  };

  const showQuickReplies = state.chatMessages.length === 1 && !typing;

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate("/home")} aria-label="Back">
          <IconArrowLeft />
        </button>
        <div className="avatar avatar--sm" style={{ background: "var(--primary-soft)" }}>💜</div>
        <div style={{ flex: 1 }}>
          <h2>MindMate AI</h2>
          <span className="status"><span className="status-dot" /> Completely private companion</span>
        </div>
        <button className="icon-plain" aria-label="Info"><IconInfo /></button>
      </div>

      <div className="chat-body" ref={scrollRef}>
        <div className="chat-day">TODAY</div>
        {state.chatMessages.map((m) => (
          <div key={m.id} className={"bubble " + (m.from === "bot" ? "bubble--bot" : "bubble--user")}>
            {m.text}
          </div>
        ))}

        {typing && (
          <div className="typing-bubble">
            <span /><span /><span />
          </div>
        )}

        {showQuickReplies && (
          <div className="quick-replies">
            {QUICK_REPLIES.map((q, i) => (
              <button
                key={q}
                className={"quick-reply" + (i === 1 ? " quick-reply--ghost" : "")}
                onClick={() => handleSend(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(draft);
        }}
      >
        <button type="button" className="icon-plain"><IconSmile /></button>
        <input
          className="input"
          placeholder="Message MindMate..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="button" className="icon-plain"><IconMic /></button>
        <button type="submit" className="icon-round" disabled={!draft.trim()} aria-label="Send">
          <IconSend />
        </button>
      </form>
    </div>
  );
}
