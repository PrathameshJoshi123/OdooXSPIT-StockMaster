import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Mail, Phone, MapPin, Calendar, Settings } from "lucide-react";
import NavBar from "../components/NavBar";

const mockUser = {
  name: "Avery Johnson",
  role: "Inventory Coordinator",
  email: "avery.johnson@stockmaster.app",
  phone: "+1 (212) 555-0198",
  location: "Main Fulfillment Center, NYC",
  joined: "March 2024",
  permissions: ["Manage Receipts", "Approve Deliveries", "Inventory Adjustments"],
  preferences: {
    notifications: "Email & In-App Alerts",
    shift: "08:00 AM – 05:00 PM",
    warehouses: ["Main Warehouse", "Secondary Warehouse"],
  },
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
  const navigate = useNavigate();

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
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-200 dark:shadow-slate-900/40">
                <User size={28} />
              </div>
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100/80 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200">
                  Active Profile
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                  {mockUser.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{mockUser.role}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Update Details
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.01] hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                View Dashboard
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-indigo-500" />
                <span>{mockUser.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-indigo-500" />
                <span>{mockUser.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-indigo-500" />
                <span>{mockUser.location}</span>
              </div>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-indigo-500" />
                <span>Member since {mockUser.joined}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-indigo-500" />
                <span>Permissions: {mockUser.permissions.join(", ")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Settings size={16} className="text-indigo-500" />
                <span>Preferred warehouses: {mockUser.preferences.warehouses.join(" • ")}</span>
              </div>
            </div>
          </div>
        </section>

       
      </main>
    </div>
  );
}
