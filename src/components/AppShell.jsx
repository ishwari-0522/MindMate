export default function AppShell({ children, wide }) {
  return (
    <div className={"app-shell" + (wide ? " app-shell--wide" : "")}>
      <div className="app-shell__inner">{children}</div>
    </div>
  );
}
