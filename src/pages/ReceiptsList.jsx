import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react";

const statusTone = {
  Draft:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
  Ready:
    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
  Done: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
};

const stageOrder = ["Draft", "Ready", "Done"];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ReceiptsList({ receipts = [], onCreateReceipt }) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return receipts;
    return receipts.filter((receipt) =>
      [receipt.reference, receipt.from, receipt.to]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(normalized))
    );
  }, [receipts, query]);

  const grouped = useMemo(() => {
    const base = stageOrder.reduce((acc, stage) => {
      acc[stage] = [];
      return acc;
    }, {});
    filtered.forEach((receipt) => {
      const bucket = stageOrder.includes(receipt.status)
        ? receipt.status
        : "Draft";
      base[bucket].push(receipt);
    });
    return base;
  }, [filtered]);

  const handleCreate = () => {
    if (!onCreateReceipt) return;
    const receipt = onCreateReceipt();
    navigate(`/operations/receipts/${receipt.id}`);
  };

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Incoming Stock
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitor all inbound transfers, ASN, and vendor deliveries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("list")}
              className={`h-11 w-11 rounded-2xl border transition flex items-center justify-center ${
                viewMode === "list"
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
              }`}
              title="List view"
            >
              <LayoutList size={18} />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`h-11 w-11 rounded-2xl border transition flex items-center justify-center ${
                viewMode === "kanban"
                  ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
              }`}
              title="Kanban view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900 dark:shadow-slate-900/40"
            >
              <Plus size={16} /> New
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference, vendor, or destination"
              className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100"
            />
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/30">
        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="text-left text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <tr>
                  {["Reference", "From", "To", "Schedule Date", "Status"].map(
                    (header) => (
                      <th key={header} className="px-6 py-4 font-semibold">
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-10 text-center text-slate-400 dark:text-slate-500"
                      colSpan={5}
                    >
                      No receipts match your search.
                    </td>
                  </tr>
                )}
                {filtered.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      <Link
                        to={`/operations/receipts/${receipt.id}`}
                        className="text-indigo-500 hover:underline"
                      >
                        {receipt.reference}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {receipt.from}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {receipt.to}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(receipt.scheduleDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                          statusTone[receipt.status] || statusTone.Draft
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 py-6 sm:grid-cols-2 lg:grid-cols-3">
            {stageOrder.map((stage) => (
              <div
                key={stage}
                className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-300">
                  <span>{stage}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {grouped[stage].length}
                  </span>
                </header>
                <div className="flex-1 space-y-4 p-4">
                  {grouped[stage].length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
                      No records
                    </p>
                  ) : (
                    grouped[stage].map((receipt) => (
                      <article
                        key={receipt.id}
                        className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/40"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/operations/receipts/${receipt.id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-500 dark:text-white"
                          >
                            {receipt.reference}
                          </Link>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold ${
                              statusTone[receipt.status] || statusTone.Draft
                            }`}
                          >
                            {receipt.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {receipt.from}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          To: {receipt.to}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>{formatDate(receipt.scheduleDate)}</span>
                          <button
                            onClick={() =>
                              navigate(`/operations/receipts/${receipt.id}`)
                            }
                            className="rounded-xl border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
                          >
                            Open
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
