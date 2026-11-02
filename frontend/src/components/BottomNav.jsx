import { NavLink } from "react-router-dom";

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  journal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.6A7.96 7.96 0 0 1 4 12Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trends: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 17 9.5 11l4 4L20 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.8 4.2-5.5 7-5.5S17.8 16.2 19 20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS = [
  { to: "/home", key: "home", label: "Home" },
  { to: "/journal", key: "journal", label: "Journal" },
  { to: "/chat", key: "chat", label: "Chat" },
  { to: "/trends", key: "trends", label: "Trends" },
  { to: "/profile", key: "profile", label: "Profile" },
];

// desktopOnly: show as the left sidebar on wide screens only (the phone chat keeps its full height).
export default function BottomNav({ desktopOnly = false }) {
  return (
    <nav className={"bottom-nav" + (desktopOnly ? " bottom-nav--desktop-only" : "")}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">💜</span>
        MindMate
      </div>
      {TABS.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          className={({ isActive }) => "nav-item" + (isActive ? " nav-item--active" : "")}
        >
          <span className="nav-icon">{ICONS[tab.key]}</span>
          <span className="nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
