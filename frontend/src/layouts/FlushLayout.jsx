import { Outlet } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import BottomNav from "../components/BottomNav.jsx";

export default function FlushLayout() {
  return (
    <AppShell wide>
      <div className="flush-frame">
        <Outlet />
      </div>
      <BottomNav desktopOnly />
    </AppShell>
  );
}
