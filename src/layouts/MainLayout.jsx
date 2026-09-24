import { Outlet } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import BottomNav from "../components/BottomNav.jsx";

export default function MainLayout() {
  return (
    <AppShell wide>
      <div className="page-scroll page-scroll--with-nav">
        <Outlet />
      </div>
      <BottomNav />
    </AppShell>
  );
}
