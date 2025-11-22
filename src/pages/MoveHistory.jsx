import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LayoutGrid, List, Search } from "lucide-react";
import NavBar from "../components/NavBar";

const defaultMoves = [
  {
    id: "mh-0001",
    reference: "PO-1045",
    date: "2024-03-04",
    contact: "Sarah Khan",
    from: "Receiving Dock",
    to: "Bulk Zone B",
    quantity: 120,
    status: "Ready",
  },
  {
    id: "mh-0002",
    reference: "SO-8821",
    date: "2024-03-05",
    contact: "Aamir Patel",
    from: "Bulk Zone B",
    to: "Outbound Staging",
    quantity: 64,
    status: "Draft",
  },
  {
    id: "mh-0003",
    reference: "RT-3310",
    date: "2024-03-05",
    contact: "Ria Das",
    from: "Returns Bay",
    to: "Inspection",
    quantity: 18,
    status: "Ready",
  },
  {
    id: "mh-0004",
    reference: "XM-7742",
    date: "2024-03-06",
    contact: "LogiCrew",
    from: "Bulk Zone B",
    to: "Rack A-12",
    quantity: 42,
    status: "Ready",
  },
  {
    id: "mh-0005",
    reference: "SO-8842",
    date: "2024-03-06",
    contact: "Daniel Ortiz",
    from: "Rack A-12",
    to: "Outbound Staging",
    quantity: 32,
    status: "Done",
  },
   {
    id: "mh-0007",
    reference: "SO-8842",
    date: "2024-03-06",
    contact: "Daniel Ortiz",
    from: "Rack A-12",
    to: "Outbound Staging",
    quantity: 32,
    status: "Done",
  },
];

const statusStyles = {
  Ready: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  Draft: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  Done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function MoveHistory({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("move-history");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReference, setSelectedReference] = useState("all");
  const [selectedContact, setSelectedContact] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const navigate = useNavigate();

  const references = useMemo(() => [
    "all",
    ...Array.from(new Set(defaultMoves.map((move) => move.reference))).sort(),
  ], []);

  const contacts = useMemo(() => [
    "all",
    ...Array.from(new Set(defaultMoves.map((move) => move.contact))).sort(),
  ], []);

  const filteredMoves = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return defaultMoves.filter((move) => {
      const matchesSearch =
        term.length === 0 ||
        move.reference.toLowerCase().includes(term) ||
        move.contact.toLowerCase().includes(term) ||
        move.from.toLowerCase().includes(term) ||
        move.to.toLowerCase().includes(term);

      const matchesReference =
        selectedReference === "all" || selectedReference === move.reference;
      const matchesContact =
        selectedContact === "all" || selectedContact === move.contact;

      return matchesSearch && matchesReference && matchesContact;
    });
  }, [selectedContact, selectedReference, searchTerm]);

  const boardStatuses = ["Ready", "Draft", "Done"];

  const groupedMoves = useMemo(() => {
    return filteredMoves.reduce((groups, move) => {
      if (!groups[move.status]) {
        groups[move.status] = [];
      }
      groups[move.status].push(move);
      return groups;
    }, {});
  }, [filteredMoves]);

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
    if (route === "move-history") {
      setActiveRoute("move-history");
      navigate("/moves");
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
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-indigo-500 blur-[140px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-purple-700 blur-[160px]" />
        <div className="absolute bottom-[-18%] right-1/3 h-72 w-72 rounded-full bg-cyan-500 blur-[150px]" />
      </div>

      <NavBar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
      />

      <main className="relative z-10 mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col gap-6 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 no-scrollbar">
        <header className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Move History</h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Track every transfer, receipt, and dispatch with live filters for rapid reconciliation.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/30">
          <div className="flex flex-col gap-6 border-b border-slate-100 pb-6 dark:border-slate-800">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-500 shadow-sm transition focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:focus-within:border-indigo-500/70 dark:focus-within:ring-indigo-500/20">
                <Search size={16} className="text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search reference, contact, or location"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    viewMode === "table"
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300 dark:border-white dark:bg-white dark:text-slate-900 dark:shadow-slate-900/40"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                  }`}
                >
                  <List size={16} /> Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("board")}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    viewMode === "board"
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300 dark:border-white dark:bg-white dark:text-slate-900 dark:shadow-slate-900/40"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                  }`}
                >
                  <LayoutGrid size={16} /> Board
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Reference
                <div className="relative">
                  <select
                    value={selectedReference}
                    onChange={(event) => setSelectedReference(event.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-white/90 px-4 py-2 pr-10 text-xs font-medium uppercase tracking-[0.2em] text-slate-700 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:focus:border-indigo-500/70 dark:focus:ring-indigo-500/20"
                  >
                    {references.map((ref) => (
                      <option key={ref} value={ref}>
                        {ref === "all" ? "All" : ref}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                </div>
              </label>

              <label className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Contact
                <div className="relative">
                  <select
                    value={selectedContact}
                    onChange={(event) => setSelectedContact(event.target.value)}
                    className="appearance-none rounded-full border border-slate-200 bg-white/90 px-4 py-2 pr-10 text-xs font-medium uppercase tracking-[0.2em] text-slate-700 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:focus:border-indigo-500/70 dark:focus:ring-indigo-500/20"
                  >
                    {contacts.map((contact) => (
                      <option key={contact} value={contact}>
                        {contact === "all" ? "All" : contact}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                </div>
              </label>

              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Showing
                <span className="rounded-full bg-slate-900 px-3 py-1 text-white dark:bg-white dark:text-slate-900">
                  {filteredMoves.length}
                </span>
                of {defaultMoves.length}
              </div>
            </div>
          </div>

          {viewMode === "table" ? (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr_0.6fr_0.7fr] items-center gap-6 bg-slate-100/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                <span>Reference</span>
                <span>Date</span>
                <span>Contact</span>
                <span>From</span>
                <span>To</span>
                <span className="text-right">Qty</span>
                <span className="pl-2">Status</span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredMoves.map((move) => (
                  <div
                    key={move.id}
                    className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr_0.6fr_0.7fr] items-center gap-6 px-4 py-4 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">{move.reference}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                        #{move.id}
                      </p>
                    </div>
                    <span>{move.date}</span>
                    <span>{move.contact}</span>
                    <span>{move.from}</span>
                    <span>{move.to}</span>
                    <span className="text-right font-semibold text-slate-900 dark:text-white">
                      {move.quantity}
                    </span>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[move.status] || "bg-slate-200 text-slate-600"
                      } justify-self-start md:justify-self-center`}
                    >
                      {move.status}
                    </span>
                  </div>
                ))}
                {filteredMoves.length === 0 && (
                  <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No move history matches the current filters.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex items-start gap-6">
              {boardStatuses.map((status) => {
                const moves = groupedMoves[status] || [];
                return (
                  <div
                    key={status}
                    className="flex w-full flex-col gap-4 rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 md:w-[22rem]"
                  >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {status}
                    </span>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                      {moves.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {moves.map((move) => (
                      <article
                        key={move.id}
                        className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-indigo-500/70"
                      >
                        <header className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {move.reference}
                            </p>
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
                              #{move.id}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[status] || "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>
                        </header>
                        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                          <div>
                            <dt className="text-[0.65rem]">Date</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                              {move.date}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.65rem]">Contact</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                              {move.contact}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.65rem]">From</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                              {move.from}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.65rem]">To</dt>
                            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                              {move.to}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[0.65rem]">Quantity</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                              {move.quantity}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                    {moves.length === 0 && (
                      <p className="rounded-3xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                        No items in this lane.
                      </p>
                    )}
                  </div>
                </div>
              );
              })}
              {filteredMoves.length === 0 && (
                <div className="w-full rounded-[24px] border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Filters returned no results.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
