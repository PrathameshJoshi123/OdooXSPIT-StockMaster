import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Printer, X, FileText, Plus } from "lucide-react";
import NavBar from "../components/NavBar";
import deliveryApi from "../lib/delivery";
import api, { getToken } from "../lib/api";

const stepOrder = ["Draft", "Ready", "Done"];

const statusColors = {
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300",
  Ready: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200",
  Done: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

export default function ReceiptsDetail({ theme, onToggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [op, parts] = await Promise.all([
          deliveryApi.getOperation(id),
          api.request("/partners", { headers }),
        ]);
        // determine responsible (creator) name if available, else fall back to current user
        let responsibleName = "";
        try {
          if (op.created_by_id) {
            const creator = await api.request(`/users/${op.created_by_id}`, {
              headers,
            });
            responsibleName = creator.full_name || creator.email || "";
          } else {
            const me = await api.request(`/users/me`, { headers });
            responsibleName = me.full_name || me.email || "";
          }
        } catch (e) {
          // ignore and leave blank
        }
        if (!mounted) return;
        const normalized = {
          id: op.id,
          reference: op.reference,
          from: parts.find((p) => p.id === op.partner_id)?.name || "",
          operationType: op.operation_type,
          sourceLocationName: op.source_location_name || "",
          destLocationName: op.dest_location_name || "",
          source_loc_id: op.source_loc_id,
          dest_loc_id: op.dest_loc_id,
          partner_id: op.partner_id,
          source_location: op.source_location_name,
          dest_location: op.dest_location_name,
          status:
            (op.status || "draft").charAt(0).toUpperCase() +
            (op.status || "").slice(1),
          scheduleDate: op.scheduled_date,
          scheduleDateRaw: op.scheduled_date,
          scheduleDateFormatted: formatDate(op.scheduled_date),
          sourceDocument: op.get?.source_document || "",
          responsible: responsibleName || "",
          lines: (op.lines || []).map((l) => ({
            id: l.id,
            product: `#${l.product_id}`,
            uom: "Units",
            scheduledQty: l.demand_qty,
            doneQty: l.done_qty,
          })),
        };
        setReceipt(normalized);
        setVendors(parts || []);
      } catch (err) {
        console.error(err);
        setReceipt(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const commit = (updater) => {
    setReceipt((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? updater(prev) : updater;
      const payload = {
        partner_id: prev.partner_id,
        scheduled_date: prev.scheduleDateRaw,
        status: prev.status ? prev.status.toLowerCase() : undefined,
        lines: prev.lines.map((l) => ({ id: l.id, done_qty: l.doneQty })),
      };
      deliveryApi
        .patchOperation(prev.id, payload)
        .catch((e) => console.warn("Failed to persist receipt update", e));
      return next;
    });
  };

  const addLine = () => {
    setReceipt((prev) => ({
      ...prev,
      lines: [
        ...(prev.lines || []),
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
    setReceipt((prev) => ({
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
    const payload = {
      lines: [
        {
          id: lineId,
          done_qty: field === "doneQty" ? Number(value) : undefined,
        },
      ],
    };
    deliveryApi.patchOperation(id, payload).catch(() => {});
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (!receipt)
    return (
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
          Receipts
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Receipt not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          The reference you tried to open does not exist.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:text-slate-200"
        >
          <ArrowLeft size={16} /> Go back
        </button>
      </main>
    );

  const statusIndex = stepOrder.indexOf(receipt?.status ?? "Draft");

  const handleStatusChange = (nextStatus) => {
    setReceipt((prev) => ({ ...prev, status: nextStatus }));
    const payload = { status: nextStatus.toLowerCase() };
    deliveryApi.patchOperation(id, payload).catch(() => {});
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white overflow-hidden">
      <NavBar
        activeRoute={"receipts"}
        onNavigate={() => {}}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/40">
          <div className="space-y-4">
            <nav className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
              Receipts / {receipt.reference}
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              {receipt.status === "Draft" && (
                <button
                  onClick={() => handleStatusChange("Ready")}
                  className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
                >
                  Mark as To Do
                </button>
              )}
              {receipt.status === "Ready" && (
                <button
                  onClick={() => handleStatusChange("Done")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 hover:-translate-y-0.5 dark:bg-white dark:text-slate-900 dark:shadow-slate-900/40"
                >
                  <Check size={16} /> Validate
                </button>
              )}
              {receipt.status === "Done" && (
                <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-200">
                  <Printer size={16} /> Print
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
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
                value={receipt.from}
                onChange={(e) => {
                  setReceipt((prev) => ({ ...prev, from: e.target.value }));
                  deliveryApi
                    .patchOperation(id, {
                      partner_id: vendors.find((v) => v.name === e.target.value)
                        ?.id,
                    })
                    .catch(() => {});
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
              >
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.name}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Operation Type
              </span>
              <input
                value={receipt.operationType}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Source Document
              </span>
              <input
                value={receipt.sourceDocument || ""}
                onChange={(e) =>
                  setReceipt((prev) => ({
                    ...prev,
                    sourceDocument: e.target.value,
                  }))
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
                value={
                  receipt.scheduleDateRaw
                    ? new Date(receipt.scheduleDateRaw)
                        .toISOString()
                        .substr(0, 10)
                    : ""
                }
                onChange={(e) => {
                  setReceipt((prev) => ({
                    ...prev,
                    scheduleDateRaw: e.target.value,
                  }));
                  deliveryApi
                    .patchOperation(id, { scheduled_date: e.target.value })
                    .catch(() => {});
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Responsible
              </span>
              <input
                value={receipt.responsible}
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
                statusColors[receipt.status] || statusColors.Draft
              }`}
            >
              {receipt.status} · Scheduled{" "}
              {receipt.lines.reduce(
                (sum, line) => sum + Number(line.scheduledQty || 0),
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
                {receipt.lines.map((line) => (
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
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400"
          >
            <ArrowLeft size={14} /> Back to list
          </button>
          <span>Last updated · {formatDate(receipt.scheduleDateRaw)}</span>
        </footer>
      </main>
    </div>
  );
}
