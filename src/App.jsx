import React, { useState, useEffect } from "react";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-72 max-w-5xl rounded-full bg-gradient-to-br from-indigo-200 via-sky-100 to-white blur-3xl opacity-70 dark:from-indigo-900 dark:via-slate-900 dark:to-transparent" />
      <NavBar
        activeRoute={route}
        onNavigate={setRoute}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Dashboard />
    </div>
  );
}
