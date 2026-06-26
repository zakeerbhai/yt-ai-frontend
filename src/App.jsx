import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { ChannelProvider } from "./context/ChannelContext";
import AppShell from "./components/AppShell";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import VideoDetail from "./pages/VideoDetail";
import Scheduled from "./pages/Scheduled";
import Analytics from "./pages/Analytics";
import Assistant from "./pages/Assistant";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import api from "./lib/api";

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Register user in our database on first login.
  // /api/me creates the user row if it doesn't exist yet.
  useEffect(() => {
    if (user) {
      api.get("/api/me").catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-ink)" }}>
        <span className="font-mono text-xs" style={{ color: "var(--color-stone)" }}>
          Loading…
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <ChannelProvider>
      <AppShell />
    </ChannelProvider>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/videos/:videoId" element={<VideoDetail />} />
            <Route path="/scheduled" element={<Scheduled />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
