import { Outlet } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";

export default function FlushLayout() {
  return (
    <AppShell wide>
      <div className="flush-frame">
        <Outlet />
      </div>
    </AppShell>
  );
}
