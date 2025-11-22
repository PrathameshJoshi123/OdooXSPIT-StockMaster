import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Warehouse from "./pages/Warehouse";
import Location from "./pages/Location";

function Placeholder({ title, description }) {
  return (
    <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">
        Module Preview
      </p>
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="text-base text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </main>
  );
}

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("stockmaster-theme") || "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("stockmaster-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const renderRoute = () => {
    switch (route) {
      case "dashboard":
        return <Dashboard />;
      case "settings-warehouse":
        return <Warehouse />;
      case "settings-location":
        return <Location />;
      case "receipts":
        return (
          <Placeholder
            title="Receipts overview"
            description="Hook this route to your ASN or inbound queue to see all receipts in one place."
          />
        );
      case "deliveries":
        return (
          <Placeholder
            title="Deliveries overview"
            description="Connect carrier data to surface delivery waves, delays, and assignments."
          />
        );
      case "adjustments":
        return (
          <Placeholder
            title="Inventory adjustments"
            description="Track damage, shrink, and recounts once the API is wired up."
          />
        );
      case "stock":
        return (
          <Placeholder
            title="Stock view"
            description="Plug in your stock valuation or bin report here for quick audits."
          />
        );
      case "history":
        return (
          <Placeholder
            title="Move history"
            description="Replay every pick, pack, and transfer when this module goes live."
          />
        );
      default:
        return (
          <Placeholder
            title="Coming soon"
            description="Select an available module from the navigation to begin."
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-72 max-w-5xl rounded-full bg-gradient-to-br from-indigo-200 via-sky-100 to-white blur-3xl opacity-70 dark:from-indigo-900 dark:via-slate-900 dark:to-transparent" />
      <NavBar
        activeRoute={route}
        onNavigate={setRoute}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      {renderRoute()}
    </div>
  );
}
