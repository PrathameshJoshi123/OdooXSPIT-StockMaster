import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Moon, Sun } from "lucide-react";

function useOutsideAlerter(ref, handler) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                handler();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, handler]);
}

export default function NavBar({ activeRoute, onNavigate, theme, onToggleTheme, onLogout }) {
    const [opsOpen, setOpsOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const settingsRoutes = ["settings-warehouse", "settings-location"];
    const isSettingsActive = settingsRoutes.includes(activeRoute);
    const settingsRef = useRef(null);
    const opsRef = useRef(null);
    const userRef = useRef(null);
    useOutsideAlerter(opsRef, () => setOpsOpen(false));
    useOutsideAlerter(userRef, () => setUserOpen(false));
    useOutsideAlerter(settingsRef, () => setSettingsOpen(false));
  

    return (
        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                                StockMaster
                            </p>
                        </div>

                        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
                            <button
                                onClick={() => onNavigate("dashboard")}
                                className={`rounded-full px-4 py-2 transition ${activeRoute === "dashboard"
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-300 dark:bg-white dark:text-slate-900 dark:shadow-slate-900/50"
                                        : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                Dashboard
                            </button>

                            <div className="relative" ref={opsRef}>
                                <button
                                    onClick={() => setOpsOpen((v) => !v)}
                                    className="rounded-full px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white inline-flex items-center gap-2 transition dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                >
                                    Operations
                                    <ChevronDown size={16} />
                                </button>
                                <div
                                    className={`absolute left-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-900 ${opsOpen
                                            ? "opacity-100 translate-y-0"
                                            : "pointer-events-none opacity-0 -translate-y-1"
                                        }`}
                                >
                                    {[
                                        { label: "Receipts", route: "receipts" },
                                        { label: "Deliveries", route: "deliveries" },
                                        { label: "Inventory Adjustments", route: "adjustments" },
                                    ].map((item) => (
                                        <button
                                            key={item.route}
                                            className="w-full rounded-xl px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                            onClick={() => {
                                                setOpsOpen(false);
                                                onNavigate(item.route);
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => onNavigate("stock")}
                                className={`rounded-full px-4 py-2 transition ${activeRoute === "stock"
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-300 dark:bg-white dark:text-slate-900 dark:shadow-slate-900/50"
                                        : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                Stock
                            </button>
                            <button
                                onClick={() => onNavigate("history")}
                                className="rounded-full px-4 py-2 text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                            >
                                Move History
                            </button>

                            <div className="relative" ref={settingsRef}>
                                <button
                                    onClick={() => setSettingsOpen((v) => !v)}
                                    className={`rounded-full px-4 py-2 inline-flex items-center gap-2 transition ${isSettingsActive
                                            ? "bg-slate-900 text-white shadow-lg shadow-slate-300 dark:bg-white dark:text-slate-900 dark:shadow-slate-900/50"
                                            : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    Settings
                                    <ChevronDown size={16} />
                                </button>
                                <div
                                    className={`absolute right-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-900 ${settingsOpen
                                            ? "opacity-100 translate-y-0"
                                            : "pointer-events-none opacity-0 -translate-y-1"
                                        }`}
                                >
                                    {[
                                        {
                                            label: "Warehouse",
                                            route: "settings-warehouse",
                                            
                                        },
                                        {
                                            label: "Location",
                                            route: "settings-location",
                                            
                                        },
                                    ].map((item) => (
                                        <button
                                            key={item.route}
                                            className={`w-full rounded-xl px-4 py-2 text-left text-sm transition ${activeRoute === item.route
                                                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                                }`}
                                            onClick={() => {
                                                setSettingsOpen(false);
                                                onNavigate(item.route);
                                            }}
                                        >
                                            <div className="font-medium">{item.label}</div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {item.helper}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            aria-label="Toggle theme"
                            onClick={onToggleTheme}
                            className="h-11 w-11 rounded-2xl border border-white bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg shadow-slate-300 flex items-center justify-center dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-100 dark:to-white dark:text-slate-900"
                        >
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <div className="relative" ref={userRef}>
                            <button
                                aria-haspopup="menu"
                                aria-expanded={userOpen}
                                onClick={() => setUserOpen((prev) => !prev)}
                                className="h-11 w-11 rounded-2xl border border-white bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-200 flex items-center justify-center transition hover:scale-[1.02] dark:border-slate-800 dark:shadow-slate-900/40"
                            >
                                <User size={18} />
                            </button>
                            <div
                                className={`absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200 transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-900 ${userOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
                                    }`}
                            >
                                <button
                                    className="w-full rounded-xl px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    onClick={() => {
                                        setUserOpen(false);
                                        onNavigate?.("profile");
                                    }}
                                >
                                    View Profile
                                </button>
                                <button
                                    className="w-full rounded-xl px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-slate-800/60"
                                    onClick={() => {
                                        setUserOpen(false);
                                        onLogout?.();
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
