import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { getToken } from "../lib/api";

function FormField({ label, placeholder, value, onChange, type = "text" }) {
  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500/70 dark:focus:ring-indigo-500/20";

  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <input
        className={inputStyles}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </label>
  );
}

export default function Partner({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("partners");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

  const [partners, setPartners] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    partner_type: "vendor",
    contact: "",
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadPartners();
  }, []);

  async function loadPartners() {
    setLoading(true);
    setMessage(null);
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/partners`, { headers });
      if (!res.ok) throw new Error(`Failed to load partners (${res.status})`);
      const data = await res.json();
      setPartners(data || []);
      if (data && data.length > 0 && !selectedId)
        selectPartner(data[0].id, data[0]);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function selectPartner(id, obj) {
    setSelectedId(id);
    if (obj) {
      setForm({
        name: obj.name || "",
        partner_type: obj.partner_type || "vendor",
        contact: obj.contact || "",
      });
      setOriginal({ ...obj });
    } else {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      fetch(`${API_BASE}/partners/${id}`, { headers })
        .then((r) => r.json())
        .then((d) => {
          setForm({
            name: d.name || "",
            partner_type: d.partner_type || "vendor",
            contact: d.contact || "",
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

  async function savePartner() {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name || "",
        partner_type: form.partner_type || "vendor",
        contact: form.contact || null,
      };
      const token = getToken();
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      let res;
      if (selectedId) {
        res = await fetch(`${API_BASE}/partners/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/partners/`, {
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
      setMessage({ type: "success", text: "Partner saved" });
      await loadPartners();
      setSelectedId(saved.id);
      setOriginal(saved);
      setForm({
        name: saved.name || "",
        partner_type: saved.partner_type || "vendor",
        contact: saved.contact || "",
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
        partner_type: original.partner_type || "vendor",
        contact: original.contact || "",
      });
      setMessage({ type: "info", text: "Changes discarded" });
    } else {
      setForm({ name: "", partner_type: "vendor", contact: "" });
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
            Partners
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Create and manage vendors and customers.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/30">
          <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Partner Details
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
                  selectPartner(
                    e.target.value,
                    partners.find(
                      (p) => String(p.id) === String(e.target.value)
                    )
                  )
                }
              >
                <option value="">-- New Partner --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.partner_type})
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <FormField
              label="Name"
              placeholder="Acme Supplies"
              value={form.name}
              onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            />
            <div>
              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Type
                </span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white/60 px-4 py-3"
                  value={form.partner_type}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, partner_type: e.target.value }))
                  }
                >
                  <option value="vendor">Vendor</option>
                  <option value="customer">Customer</option>
                </select>
              </label>
            </div>
            <FormField
              label="Contact"
              placeholder="email or phone"
              value={form.contact}
              onChange={(v) => setForm((s) => ({ ...s, contact: v }))}
            />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              disabled={saving}
              onClick={savePartner}
              className="rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:translate-y-[-1px] hover:from-indigo-500 hover:to-purple-500"
            >
              {saving ? "Saving..." : "Save Partner"}
            </button>
            <button
              onClick={discardChanges}
              className="rounded-2xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
            >
              Discard Changes
            </button>
            <button
              onClick={() => loadPartners()}
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
