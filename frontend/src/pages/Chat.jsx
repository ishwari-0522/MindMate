import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorMessage } from "../api/client.js";
import { useAsync } from "../api/useAsync.js";
import { IconArrowLeft, IconInfo, IconSend, IconMic, IconSmile } from "../components/Icons.jsx";

const QUICK_REPLIES = ["Yes, guide me through box breathing", "I just want to talk"];

export default function Chat() {
  const navigate = useNavigate();
  const history = useAsync(() => api.get("/chat"), []);
  const [sent, setSent] = useState([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef(null);

  const messages = [...(history.data?.messages ?? []), ...sent];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  const handleSend = async (text) => {
    const value = text.trim();
    if (!value || typing) return;
    const tempId = `tmp-${Date.now()}`;
    setSendError("");
    setDraft("");
    setSent((s) => [...s, { id: tempId, from: "user", text: value }]);
    setTyping(true);
    try {
      const res = await api.post("/chat", { text: value });
      setSent((s) => [...s.filter((m) => m.id !== tempId), ...res.messages]);
    } catch (err) {
      setSent((s) => s.filter((m) => m.id !== tempId));
      setDraft(value);
      setSendError(errorMessage(err));
    } finally {
      setTyping(false);
    }
  };

  const showQuickReplies = messages.length === 1 && !typing;

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
        {history.error && <p className="form-error" role="alert">{history.error.message}</p>}
        {messages.map((m) => (
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
        {sendError && <p className="form-error" role="alert">{sendError}</p>}
      </div>

      <form
        className="chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(draft);
        }}
      >
        <button type="button" className="icon-plain" aria-label="Emoji"><IconSmile /></button>
        <input
          className="input"
          placeholder="Message MindMate..."
          maxLength={2000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="button" className="icon-plain" aria-label="Voice"><IconMic /></button>
        <button type="submit" className="icon-round" disabled={!draft.trim() || typing} aria-label="Send">
          <IconSend />
        </button>
      </form>
    </div>
  );
}
