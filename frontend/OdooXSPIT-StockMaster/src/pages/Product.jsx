import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { getToken } from "../lib/api";

function FormField({
  label,
  placeholder,
  multiline = false,
  value,
  onChange,
  type = "text",
}) {
  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500/70 dark:focus:ring-indigo-500/20";

  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={3}
          className={`${inputStyles} resize-none`}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputStyles}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          type={type}
        />
      )}
    </label>
  );
}

export default function Product({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("products");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit_price: "",
    min_stock_level: 0,
    uom: "",
    initial_stock: "",
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setMessage(null);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/products`, { headers });
      if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
      const data = await res.json();
      setProducts(data || []);
      if (data && data.length > 0 && !selectedId)
        selectProduct(data[0].id, data[0]);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function selectProduct(id, obj) {
    setSelectedId(id);
    if (obj) {
      setForm({
        name: obj.name || "",
        sku: obj.sku || "",
        category: obj.category || "",
        unit_price: obj.unit_price || "",
        min_stock_level: obj.min_stock_level || 0,
        uom: obj.uom || "",
        initial_stock: obj.initial_stock || "",
      });
      setOriginal({ ...obj });
    } else {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      fetch(`${API_BASE}/products/${id}`, { headers })
        .then((r) => r.json())
        .then((d) => {
          setForm({
            name: d.name || "",
            sku: d.sku || "",
            category: d.category || "",
            unit_price: d.unit_price || "",
            min_stock_level: d.min_stock_level || 0,
            uom: d.uom || "",
            initial_stock: d.initial_stock || "",
          });
          setOriginal({ ...d });
        })
        .catch((e) => setMessage({ type: "error", text: e.message }));
    }
  }

  function handleNavigate(route) {
    if (route === "dashboard") {
      setActiveRoute("dashboard");
      navigate("/dashboard");
      return;
    }
    if (route === "profile") {
      navigate("/profile");
      return;
    }
    if (route === "warehouse") {
      setActiveRoute("settings-warehouse");
      navigate("/warehouse");
      return;
    }
    if (route === "location") {
      setActiveRoute("settings-location");
      navigate("/location");
      return;
    }
    if (route === "products") {
      setActiveRoute("products");
      navigate("/products");
      return;
    }
    if (route === "partners") {
      setActiveRoute("partners");
      navigate("/partners");
      return;
    }
    setActiveRoute(route);
  }

  const handleLogout = () => {
    setActiveRoute("dashboard");
    navigate("/");
  };

  async function saveProduct() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name || "",
        sku: form.sku || "",
        category: form.category || null,
        unit_price: form.unit_price ? Number(form.unit_price) : null,
        min_stock_level: form.min_stock_level
          ? Number(form.min_stock_level)
          : 0,
        uom: form.uom || null,
        initial_stock: form.initial_stock ? Number(form.initial_stock) : null,
      };
      const token = getToken();
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      let res;
      if (selectedId) {
        res = await fetch(`${API_BASE}/products/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/products/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Save failed (${res.status}): ${txt}`);
      }
      const saved = await res.json();
      setMessage({ type: "success", text: "Product saved" });
      await loadProducts();
      setSelectedId(saved.id);
      setOriginal(saved);
      setForm({
        name: saved.name || "",
        sku: saved.sku || "",
        category: saved.category || "",
        unit_price: saved.unit_price || "",
        min_stock_level: saved.min_stock_level || 0,
        uom: saved.uom || "",
        initial_stock: saved.initial_stock || "",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    if (original) {
      setForm({
        name: original.name || "",
        sku: original.sku || "",
        category: original.category || "",
        unit_price: original.unit_price || "",
        min_stock_level: original.min_stock_level || 0,
        uom: original.uom || "",
        initial_stock: original.initial_stock || "",
      });
      setMessage({ type: "info", text: "Changes discarded" });
    } else {
      setForm({
        name: "",
        sku: "",
        category: "",
        unit_price: "",
        min_stock_level: 0,
        uom: "",
        initial_stock: "",
      });
      setMessage({ type: "info", text: "Cleared" });
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-indigo-500 blur-[140px]" />
        <div className="absolute top-1/3 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-purple-700 blur-[150px]" />
        <div className="absolute bottom-[-20%] left-1/3 h-80 w-80 rounded-full bg-cyan-500 blur-[160px]" />
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
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Product Registry
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Create and manage products.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/30">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Product Details
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-500 dark:text-slate-400">
                Select
              </label>
              <select
                className="rounded-xl border px-3 py-2"
                value={selectedId || ""}
                onChange={(e) =>
                  selectProduct(
                    e.target.value,
                    products.find(
                      (p) => String(p.id) === String(e.target.value)
                    )
                  )
                }
              >
                <option value="">-- New Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <FormField
              label="Product Name"
              placeholder="Blue Widget"
              value={form.name}
              onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            />
            <FormField
              label="SKU"
              placeholder="BW-001"
              value={form.sku}
              onChange={(v) => setForm((s) => ({ ...s, sku: v }))}
            />
            <FormField
              label="Category"
              placeholder="Gadgets"
              value={form.category}
              onChange={(v) => setForm((s) => ({ ...s, category: v }))}
            />
            <FormField
              label="Unit Price"
              placeholder="0.00"
              value={form.unit_price}
              onChange={(v) => setForm((s) => ({ ...s, unit_price: v }))}
              type="number"
            />
            <FormField
              label="Min Stock Level"
              placeholder="0"
              value={form.min_stock_level}
              onChange={(v) => setForm((s) => ({ ...s, min_stock_level: v }))}
              type="number"
            />
            <FormField
              label="Unit of Measure"
              placeholder="pcs"
              value={form.uom}
              onChange={(v) => setForm((s) => ({ ...s, uom: v }))}
            />
            <FormField
              label="Initial Stock"
              placeholder="0"
              value={form.initial_stock}
              onChange={(v) => setForm((s) => ({ ...s, initial_stock: v }))}
              type="number"
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              disabled={saving}
              onClick={saveProduct}
              className="rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:translate-y-[-1px] hover:from-indigo-500 hover:to-purple-500"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
            <button
              onClick={discardChanges}
              className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            >
              Discard Changes
            </button>
            <button
              onClick={() => loadProducts()}
              className="rounded-2xl border px-4 py-2 text-sm"
            >
              Refresh
            </button>
            {loading && (
              <span className="text-sm text-slate-500">Loading...</span>
            )}
          </div>

          {message && (
            <div
              className={`mt-4 rounded-md px-4 py-3 ${
                message.type === "error"
                  ? "bg-red-50 text-red-700"
                  : message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-50 text-slate-700"
              }`}
            >
              {message.text}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
