import { useNavigate } from "react-router-dom";
import { IconClose } from "./Icons.jsx";
import { HelplineList } from "./SupportLists.jsx";

// The pop-up shown after saving a mood or entry when someone may need support (see useSupportAlert).
export default function SupportAlert({ guidance, onClose }) {
  const navigate = useNavigate();
  if (!guidance) return null;

  const reason = guidance.reasons[0];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet support-alert"
        role="alertdialog"
        aria-labelledby="support-alert-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-row">
          <h2 id="support-alert-title">{guidance.headline}</h2>
          <button className="close-x" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        {reason && <p className="support-alert-reason">{reason}</p>}
        <p className="guide-intro">{guidance.message}</p>
        {guidance.level >= 3 && guidance.helplines.length > 0 && (
          <HelplineList helplines={guidance.helplines.slice(0, 2)} />
        )}
        <div className="btn-row" style={{ marginTop: 18 }}>
          <button className="btn btn-secondary" onClick={onClose}>Not now</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onClose();
              navigate("/support");
            }}
          >
            See support options
          </button>
        </div>
      </div>
    </div>
  );
}
