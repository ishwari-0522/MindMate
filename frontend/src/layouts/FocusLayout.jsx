import { Outlet } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";

export default function FocusLayout() {
  return (
    <AppShell>
      <div className="page-scroll">
        <Outlet />
      </div>
    </AppShell>
  );
}
