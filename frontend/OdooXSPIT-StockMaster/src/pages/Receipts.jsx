import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import deliveryApi from "../lib/delivery";
import api, { getToken } from "../lib/api";

export default function Receipts({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("receipts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ops, setOps] = useState([]);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [locations, setLocations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [form, setForm] = useState({
    source_loc_id: null,
    dest_loc_id: null,
    partner_id: null,
    scheduled_date: null,
    operation_type: "receipt",
    lines: [{ product_id: null, demand_qty: 1 }],
  });
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await deliveryApi.listOperations({
        limit: 500,
        search,
        status: statusFilter,
      });
      // filter only receipts
      const receipts = (data || []).filter(
        (o) => (o.operation_type || "").toLowerCase() === "receipt"
      );
      setOps(receipts || []);
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

  useEffect(() => {
    // load selects once
    async function loadSelects() {
      try {
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [prods, parts, locs] = await Promise.all([
          api.request("/products", { headers }),
          api.request("/partners", { headers }),
          api.request("/locations", { headers }),
        ]);
        // fetch current user if available
        try {
          const me = await api.request("/users/me", { headers });
          setCurrentUser(me);
        } catch (e) {
          // not authenticated or error; ignore
        }
        setProducts(prods || []);
        setPartners(parts || []);
        setLocations(locs || []);
      } catch (e) {
        // ignore
      }
    }
    loadSelects();
  }, []);

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
      !confirm(
        "Validate this receipt? This will create stock moves and increase stock."
      )
    )
      return;
    try {
      setLoading(true);
      const res = await deliveryApi.validateOperation(opId);
      alert(res.message || "Operation validated");
      await load();
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

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
      operation_type: "receipt",
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
      // use createReceipt helper
      const created = await deliveryApi.createReceipt(payload);
      // run availability check (optional)
      try {
        await deliveryApi.checkOperation(created.id || created);
      } catch (e) {
        // ignore
      }
      await load();
      setModalOpen(false);
      setForm({
        source_loc_id: null,
        dest_loc_id: null,
        partner_id: null,
        scheduled_date: null,
        operation_type: "receipt",
        lines: [{ product_id: null, demand_qty: 1 }],
      });
      alert("Receipt created");
    } catch (err) {
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const handleNavigate = (route) => {
    setActiveRoute(route);
    try {
      navigate(`/${route}`);
    } catch (e) {}
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white overflow-hidden">
      <NavBar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4">
              <div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
                  Receipts
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Incoming receipts — receive, validate, and track.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-2xl px-3 py-2 border border-slate-200 bg-white/80 dark:bg-slate-800"
            >
              New
            </button>
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
                        No receipts found
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
                            <button
                              onClick={() => navigate(`/receipts/${o.id}`)}
                              className="rounded-xl px-3 py-1 text-sm bg-white border"
                            >
                              Open
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
        {/* New Receipt Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-w-3xl w-full rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Receipt</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-sm text-slate-500"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Receive From
                  </span>
                  <select
                    value={form.partner_id || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        partner_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    <option value="">Select vendor</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Schedule Date
                  </span>
                  <input
                    type="date"
                    value={form.scheduled_date || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, scheduled_date: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Source Location
                  </span>
                  <select
                    value={form.source_loc_id || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        source_loc_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    <option value="">Select source</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Destination Location
                  </span>
                  <select
                    value={form.dest_loc_id || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        dest_loc_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    <option value="">Select destination (optional)</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Responsible
                </span>
                <input
                  value={currentUser ? currentUser.full_name : ""}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500"
                />
              </label>

              <div className="mt-4">
                <h4 className="text-sm font-semibold">Product Lines</h4>
                <div className="mt-2 space-y-3">
                  {form.lines.map((line, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select
                        value={line.product_id || ""}
                        onChange={(e) =>
                          updateLine(idx, {
                            product_id: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={line.demand_qty}
                        onChange={(e) =>
                          updateLine(idx, {
                            demand_qty: Number(e.target.value),
                          })
                        }
                        className="w-28 rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => removeLine(idx)}
                        className="rounded-xl px-3 py-2 border"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div>
                    <button
                      onClick={addLine}
                      className="rounded-2xl px-4 py-2 border"
                    >
                      Add a line
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl px-4 py-2 border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="rounded-2xl px-4 py-2 bg-emerald-600 text-white"
                >
                  Create Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
