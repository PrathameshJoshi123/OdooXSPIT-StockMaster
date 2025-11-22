import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import deliveryApi from "../lib/delivery";
import api, { getToken } from "../lib/api";

function groupByReference(moves = []) {
  const map = new Map();
  moves.forEach((mv) => {
    const rid = mv.reference_id || `op-${mv.id}`;
    if (!map.has(rid)) map.set(rid, []);
    map.get(rid).push(mv);
  });
  // produce array of groups with summary
  return Array.from(map.entries()).map(([refId, list]) => {
    const dates = list.map((m) => new Date(m.date));
    return {
      reference_id: refId,
      lines: list,
      items: list.length,
      date: new Date(Math.min(...dates.map((d) => d.getTime()))),
    };
  });
}

export default function Delivery({ theme, onToggleTheme }) {
  const [activeRoute] = useState("deliveries");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ops, setOps] = useState([]);
  const [view, setView] = useState("list"); // 'list' | 'kanban'
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.listOperations({
        limit: 500,
        search,
        status: statusFilter,
      });
      setOps(data || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const handleCheck = async (opId) => {
    try {
      setLoading(true);
      const res = await deliveryApi.checkOperation(opId);
      alert(`Check: ${res.message || JSON.stringify(res)}`);
      await load();
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (opId) => {
    if (
      !confirm("Validate this delivery? This will decrease stock if available.")
    )
      return;
    try {
      setLoading(true);
      const res = await deliveryApi.validateOperation(opId);
      alert(res.message || "Operation validated");
      // reload
      await load();
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // --- New operation modal state & helpers ---
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [locations, setLocations] = useState([]);

  const [form, setForm] = useState({
    source_loc_id: null,
    dest_loc_id: null,
    partner_id: null,
    scheduled_date: null,
    operation_type: "delivery",
    lines: [{ product_id: null, demand_qty: 1 }],
  });

  const [lineWarnings, setLineWarnings] = useState({});

  useEffect(() => {
    // load select lists once
    async function loadSelects() {
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [prods, parts, locs] = await Promise.all([
          api.request("/products", { headers }),
          api.request("/partners", { headers }),
          api.request("/locations", { headers }),
        ]);
        setProducts(prods || []);
        setPartners(parts || []);
        setLocations(locs || []);
      } catch (e) {
        // ignore; selects optional
      }
    }
    loadSelects();
  }, []);

  function updateLine(index, changes) {
    setForm((f) => {
      const lines = [...f.lines];
      lines[index] = { ...lines[index], ...changes };
      return { ...f, lines };
    });
  }

  function addLine() {
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { product_id: null, demand_qty: 1 }],
    }));
  }

  function removeLine(i) {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  }

  async function handleCreate() {
    // basic validation
    if (!form.source_loc_id) return alert("Please select a source location");
    if (!form.lines || form.lines.length === 0)
      return alert("Add at least one product line");

    const payload = {
      operation_type: form.operation_type,
      source_loc_id: form.source_loc_id,
      dest_loc_id: form.dest_loc_id,
      partner_id: form.partner_id,
      scheduled_date: form.scheduled_date || null,
      lines: form.lines.map((l) => ({
        product_id: l.product_id,
        demand_qty: Number(l.demand_qty),
      })),
    };

    try {
      setLoading(true);
      const created = await deliveryApi.createOperation(payload);
      // run availability check to populate status and messages
      const chk = await deliveryApi.checkOperation(created.id || created);
      // parse check message for per-product shortages
      const warn = {};
      if (chk && chk.message) {
        const parts = String(chk.message)
          .split(";")
          .map((s) => s.trim());
        for (const p of parts) {
          const m = p.match(
            /Product\s+(\d+): available\s+([\d\.]+)\s+<\s+demand\s+([\d\.]+)/i
          );
          if (m) {
            const pid = Number(m[1]);
            warn[pid] = true;
          }
        }
      }
      setLineWarnings(warn);
      // refresh list and close modal
      await load();
      setModalOpen(false);
      alert(chk && chk.message ? chk.message : "Created delivery");
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white overflow-hidden">
      <NavBar
        activeRoute={activeRoute}
        onNavigate={() => {}}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-2xl px-3 py-2 border border-slate-200 bg-white/80 dark:bg-slate-800"
              >
                New
              </button>
              <div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
                  Delivery
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Outgoing delivery orders — pick, pack, validate.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference or contact"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
            </select>
            <div className="inline-flex rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 ${view === "list" ? "bg-slate-100" : ""}`}
              >
                List
              </button>
              <button
                onClick={() => setView("kanban")}
                className={`px-3 py-2 ${
                  view === "kanban" ? "bg-slate-100" : ""
                }`}
              >
                Kanban
              </button>
            </div>
            <button
              onClick={load}
              className="rounded-2xl px-4 py-2 bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md"
            >
              Refresh
            </button>
          </div>
        </header>

        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <section className="mt-4">
          {view === "list" ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 dark:bg-slate-800/50 dark:border-slate-700">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">From</th>
                    <th className="px-4 py-3">To</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Schedule date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {ops.length === 0 && !loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-slate-500"
                      >
                        No delivery orders found
                      </td>
                    </tr>
                  ) : (
                    ops.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {o.reference}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-slate-700 dark:text-slate-300">
                          {o.source_location_name || ""}
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-slate-700 dark:text-slate-300">
                          {o.dest_location_name || ""}
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-emerald-600">
                          {o.partner_name || ""}
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-slate-500 dark:text-slate-400">
                          {o.scheduled_date
                            ? new Date(o.scheduled_date).toLocaleString()
                            : ""}
                        </td>
                        <td className="px-4 py-3 align-top text-sm text-slate-700">
                          {o.status}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCheck(o.id)}
                              className="rounded-xl px-3 py-1 text-sm bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                            >
                              Check
                            </button>
                            <button
                              onClick={() => handleValidate(o.id)}
                              className="rounded-xl px-3 py-1 text-sm bg-emerald-600 text-white hover:opacity-90"
                            >
                              Validate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["draft", "waiting", "ready", "done"].map((col) => (
                <div
                  key={col}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-3 dark:bg-slate-800/50 dark:border-slate-700"
                >
                  <h3 className="text-sm font-semibold text-slate-700 capitalize">
                    {col}
                  </h3>
                  <div className="mt-3 space-y-3">
                    {ops
                      .filter((o) => (o.status || "draft") === col)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="rounded-xl border border-slate-100 p-3 bg-white dark:bg-slate-900"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                {o.reference}
                              </div>
                              <div className="text-xs text-slate-500">
                                {o.partner_name || o.source_location_name}
                              </div>
                            </div>
                            <div className="text-xs text-slate-400">
                              {o.scheduled_date
                                ? new Date(o.scheduled_date).toLocaleString()
                                : ""}
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => handleCheck(o.id)}
                              className="px-2 py-1 rounded bg-white border"
                            >
                              Check
                            </button>
                            <button
                              onClick={() => handleValidate(o.id)}
                              className="px-2 py-1 rounded bg-emerald-600 text-white"
                            >
                              Validate
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* New Operation Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">New Delivery</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-sm px-3 py-1"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500">
                    Source Location
                  </label>
                  <select
                    className="w-full rounded border px-3 py-2 mt-1"
                    value={form.source_loc_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        source_loc_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">Select source</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500">
                    Schedule Date
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded border px-3 py-2 mt-1"
                    value={form.scheduled_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, scheduled_date: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500">
                    Destination Location
                  </label>
                  <select
                    className="w-full rounded border px-3 py-2 mt-1"
                    value={form.dest_loc_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dest_loc_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">Select destination</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500">
                    Contact / Partner
                  </label>
                  <select
                    className="w-full rounded border px-3 py-2 mt-1"
                    value={form.partner_id || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        partner_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  >
                    <option value="">Select partner/contact</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Products</h3>
                <div className="space-y-3">
                  {form.lines.map((ln, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 items-center ${
                        lineWarnings[ln.product_id]
                          ? "bg-red-50 border-l-4 border-red-400 p-2 rounded"
                          : ""
                      }`}
                    >
                      <select
                        className="flex-1 rounded border px-3 py-2"
                        value={ln.product_id || ""}
                        onChange={(e) =>
                          updateLine(idx, {
                            product_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku ? `[${p.sku}] ` : ""}
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        className="w-24 rounded border px-3 py-2"
                        value={ln.demand_qty}
                        onChange={(e) =>
                          updateLine(idx, { demand_qty: e.target.value })
                        }
                      />
                      <button
                        className="px-2 py-1 text-sm"
                        onClick={() => removeLine(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    className="rounded px-3 py-2 border"
                    onClick={addLine}
                  >
                    Add New product
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-emerald-600 text-white"
                  onClick={handleCreate}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
