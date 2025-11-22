import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail } from "lucide-react";
import NavBar from "../components/NavBar";
import api, { getToken } from "../lib/api";

// Minimal fallback data: backend `UserOut` exposes `id`, `email`, and `full_name`.
const mockUser = {
  full_name: "Avery Johnson",
  email: "avery.johnson@stockmaster.app",
};

const recentActivity = [
  {
    title: "Approved delivery order DHL-239",
    timestamp: "09:42 AM",
    status: "Done",
  },
  {
    title: "Flagged low-stock alert – SKU 88431",
    timestamp: "08:15 AM",
    status: "Warning",
  },
  {
    title: "Scheduled internal transfer – Zone C to Zone F",
    timestamp: "Yesterday, 05:22 PM",
    status: "Draft",
  },
];

export default function Profile({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const data = await api.request("/users/me", { method: "GET", headers });
        if (mounted) setUser(data);
      } catch (err) {
        // keep a friendly error for UI; fall back to mock data
        if (mounted) setError(err.message || "Unable to fetch user");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleNavigate = (route) => {
    if (route === "dashboard") {
      navigate("/dashboard");
      return;
    }
    if (route === "profile") {
      navigate("/profile");
      return;
    }
    setActiveRoute(route);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-indigo-500 blur-[140px]" />
        <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-purple-700 blur-[160px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500 blur-[130px]" />
      </div>

      <NavBar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
      />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 no-scrollbar overflow-y-auto h-[calc(100vh-4rem)]">
        <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl shadow-indigo-100 ring-1 ring-white/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-slate-900/40 dark:ring-slate-800/50">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-200 dark:shadow-slate-900/40">
              <User size={28} />
            </div>
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                Active Profile
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                {loading ? "Loading..." : user?.full_name || mockUser.full_name}
              </h1>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-indigo-500" />
              <span>{user?.email || mockUser.email}</span>
            </div>
            {user?.id && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">User ID:</span>
                <span className="text-sm">{user.id}</span>
              </div>
            )}
          </div>
          {error && (
            <p className="mt-4 text-sm text-rose-600">
              Failed to load user: {error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
