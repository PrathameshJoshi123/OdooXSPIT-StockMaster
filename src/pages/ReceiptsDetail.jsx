import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Printer, X, FileText, Plus } from "lucide-react";

const stepOrder = ["Draft", "Ready", "Done"];

const statusColors = {
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300",
  Ready: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200",
  Done: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ReceiptsDetail({
  receipts = [],
  onUpdateReceipt,
  vendors = [],
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const receipt = receipts.find((entry) => entry.id === id);
  const [localReceipt, setLocalReceipt] = useState(receipt);

  const vendorChoices = useMemo(() => {
    const unique = new Set(vendors);
    if (localReceipt?.from && !unique.has(localReceipt.from)) {
      unique.add(localReceipt.from);
    }
    return Array.from(unique);
  }, [vendors, localReceipt?.from]);

  useEffect(() => {
    setLocalReceipt(receipt);
  }, [receipt]);

  const commit = (updater) => {
    setLocalReceipt((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? updater(prev) : updater;
      onUpdateReceipt?.(next);
      return next;
    });
  };

  const addLine = () => {
    commit((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: `line-${Date.now()}`,
          product: "New Product",
          uom: "Units",
          scheduledQty: 0,
          doneQty: 0,
        },
      ],
    }));
  };

  const updateLine = (lineId, field, value) => {
    commit((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              [field]: field.includes("Qty")
                ? Math.max(0, Number(value))
                : value,
            }
          : line
      ),
    }));
  };

  const statusIndex = stepOrder.indexOf(localReceipt?.status ?? "Draft");

  if (!localReceipt) {
    return (
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
          Receipts
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Receipt not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          The reference you tried to open does not exist. It may have been
          removed or not yet created.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-200"
        >
          <ArrowLeft size={16} /> Go back
        </button>
      </main>
    );
  }

  const handleStatusChange = (nextStatus) => {
    commit((prev) => ({ ...prev, status: nextStatus }));
  };

  const handleFieldChange = (field, value) => {
    commit((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/40">
        <div className="space-y-4">
          <nav className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
            Receipts / {localReceipt.reference}
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            {localReceipt.status === "Draft" && (
              <button
                onClick={() => handleStatusChange("Ready")}
                className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
              >
                Mark as To Do
              </button>
            )}
            {localReceipt.status === "Ready" && (
              <button
                onClick={() => handleStatusChange("Done")}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 hover:-translate-y-0.5 dark:bg-white dark:text-slate-900 dark:shadow-slate-900/40"
              >
                <Check size={16} /> Validate
              </button>
            )}
            {localReceipt.status === "Done" && (
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200">
                <Printer size={16} /> Print
              </button>
            )}
            <button
              onClick={() => navigate("/operations/receipts")}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-2 text-sm font-semibold text-rose-500 hover:border-rose-300 dark:border-rose-500/40 dark:text-rose-300"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          {stepOrder.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  index <= statusIndex
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "border border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {step}
              </span>
              {index < stepOrder.length - 1 && (
                <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          ))}
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/40">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Receive From
            </span>
            <select
              value={localReceipt.from}
              onChange={(e) => handleFieldChange("from", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
            >
              {vendorChoices.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Operation Type
            </span>
            <input
              value={localReceipt.operationType}
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Source Document
            </span>
            <input
              value={localReceipt.sourceDocument}
              onChange={(e) =>
                handleFieldChange("sourceDocument", e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
              placeholder="Vendor Bill #"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Schedule Date
            </span>
            <input
              type="date"
              value={localReceipt.scheduleDate}
              onChange={(e) =>
                handleFieldChange("scheduleDate", e.target.value)
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Responsible
            </span>
            <input
              value={localReceipt.responsible}
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
            />
          </label>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/40">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <FileText size={16} /> Product Lines
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              statusColors[localReceipt.status] || statusColors.Draft
            }`}
          >
            {localReceipt.status} · Scheduled{" "}
            {localReceipt.lines.reduce(
              (sum, line) => sum + line.scheduledQty,
              0
            )}
          </span>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <tr>
                {[
                  "Product",
                  "Unit of Measure",
                  "Scheduled Qty",
                  "Done Qty",
                ].map((col) => (
                  <th key={col} className="px-6 py-3 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {localReceipt.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-6 py-3 font-medium text-slate-800 dark:text-slate-100">
                    {line.product}
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                    {line.uom}
                  </td>
                  <td className="px-6 py-3 text-slate-500 dark:text-slate-400">
                    {line.scheduledQty}
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      min={0}
                      value={line.doneQty}
                      onChange={(e) =>
                        updateLine(line.id, "doneQty", e.target.value)
                      }
                      className="w-32 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-dashed border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <button
            onClick={addLine}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
          >
            <Plus size={16} /> Add a line
          </button>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
        <button
          onClick={() => navigate("/operations/receipts")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
        >
          <ArrowLeft size={14} /> Back to list
        </button>
        <span>Last updated · {formatDate(localReceipt.scheduleDate)}</span>
      </footer>
    </main>
  );
}
