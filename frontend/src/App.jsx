import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "./context/AppContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import FocusLayout from "./layouts/FocusLayout.jsx";
import FlushLayout from "./layouts/FlushLayout.jsx";

import Onboarding from "./pages/Onboarding.jsx";
import SignUp from "./pages/SignUp.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Screening from "./pages/Screening.jsx";
import Journal from "./pages/Journal.jsx";
import Chat from "./pages/Chat.jsx";
import Trends from "./pages/Trends.jsx";
import Coping from "./pages/Coping.jsx";
import BookSupport from "./pages/BookSupport.jsx";
import Profile from "./pages/Profile.jsx";

function RequireAuth({ children }) {
  const { state } = useApp();
  if (!state.authed) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { state } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<FocusLayout />}>
          <Route
            path="/"
            element={state.authed ? <Navigate to="/home" replace /> : <Onboarding />}
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/screening/:type"
            element={
              <RequireAuth>
                <Screening />
              </RequireAuth>
            }
          />
        </Route>

        <Route element={<FlushLayout />}>
          <Route
            path="/chat"
            element={
              <RequireAuth>
                <Chat />
              </RequireAuth>
            }
          />
        </Route>

        <Route element={<MainLayout />}>
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/journal"
            element={
              <RequireAuth>
                <Journal />
              </RequireAuth>
            }
          />
          <Route
            path="/trends"
            element={
              <RequireAuth>
                <Trends />
              </RequireAuth>
            }
          />
          <Route
            path="/coping"
            element={
              <RequireAuth>
                <Coping />
              </RequireAuth>
            }
          />
          <Route
            path="/book"
            element={
              <RequireAuth>
                <BookSupport />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
