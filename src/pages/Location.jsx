import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Route, Barcode, ShieldCheck, ClipboardCheck } from "lucide-react";
import NavBar from "../components/NavBar";

function FormField({ label, placeholder, multiline = false, type = "text" }) {
  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500/70 dark:focus:ring-indigo-500/20";

  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {multiline ? (
        <textarea rows={3} className={`${inputStyles} resize-none`} placeholder={placeholder} />
      ) : (
        <input className={inputStyles} placeholder={placeholder} type={type} />
      )}
    </label>
  );
}



export default function Location({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("settings-location");
  const navigate = useNavigate();

  const handleNavigate = (route) => {
    if (route === "dashboard") {
      setActiveRoute("dashboard");
      navigate("/dashboard");
      return;
    }
    if (route === "profile") {
      navigate("/profile");
      return;
    }
    if (route === "settings-warehouse") {
      setActiveRoute("settings-warehouse");
      navigate("/warehouse");
      return;
    }
    if (route === "settings-location") {
      setActiveRoute("settings-location");
      navigate("/location");
      return;
    }
    if (route === "stock") {
      setActiveRoute("stock");
      navigate("/stock");
      return;
    }
    setActiveRoute(route);
  };

  const handleLogout = () => {
    setActiveRoute("dashboard");
    navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-indigo-500 blur-[140px]" />
        <div className="absolute top-1/2 left-0 h-80 w-80 -translate-x-1/3 rounded-full bg-purple-700 blur-[160px]" />
        <div className="absolute bottom-[-18%] right-1/3 h-80 w-80 rounded-full bg-cyan-500 blur-[150px]" />
      </div>

      <NavBar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
      />

      <main className="relative z-10 mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col gap-6 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 no-scrollbar">
        <header className="max-w-3xl space-y-4">
          
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Location Registry</h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Manage aisles, rooms, or bin locations.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/30">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Location Details
              </h2>
            </div>
            
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <FormField label="Location Name" placeholder="Inbound Dock A" />
            <FormField label="Short Code" placeholder="IDA" />
            <FormField label="Linked Warehouse" placeholder="Select warehouse" />
            
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button className="rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:translate-y-[-1px] hover:from-indigo-500 hover:to-purple-500">
              Save Location
            </button>
            <button className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white">
              Discard Changes
            </button>
          </div>
        </section>

        
      </main>
    </div>
  );
}
