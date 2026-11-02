import { Link } from "react-router-dom";

const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// One suggestion, link or website. Internal paths use the router; everything else opens in a new tab.
export function ResourceCard({ item, actionLabel = "Open" }) {
  const href = item.url;
  return (
    <div className="resource-card">
      <div>
        <h4>{item.title}</h4>
        {item.description && <p>{item.description}</p>}
      </div>
      {href &&
        (href.startsWith("/") ? (
          <Link className="resource-link" to={href}>{actionLabel}</Link>
        ) : (
          <a className="resource-link" href={href} target="_blank" rel="noopener noreferrer">
            {actionLabel}
          </a>
        ))}
    </div>
  );
}

export function HelplineList({ helplines }) {
  return (
    <div className="helpline-list">
      {helplines.map((h) => (
        <div className={"helpline" + (h.kind === "emergency" ? " helpline--emergency" : "")} key={h.id}>
          <div>
            <h4>{h.title}</h4>
            <p>{h.description}</p>
            <p className="helpline-meta">
              {[h.hours, h.languages?.length ? h.languages.join(", ") : null].filter(Boolean).join(" · ")}
            </p>
          </div>
          <a className="helpline-call" href={telHref(h.phone)} aria-label={`Call ${h.title} on ${h.phone}`}>
            {h.phone}
          </a>
        </div>
      ))}
    </div>
  );
}
