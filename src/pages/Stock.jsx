import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import NavBar from "../components/NavBar";

const defaultInventory = [
  {
    id: "desk-main",
    product: "Desk",
    unitCost: 3000,
    currency: "Rs",
    onHand: 50,
    reserved: 5,
  },
  {
    id: "table-staging",
    product: "Table",
    unitCost: 3000,
    currency: "Rs",
    onHand: 50,
    reserved: 45,
  },
];

export default function Stock({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("stock");
  const [inventory, setInventory] = useState(defaultInventory);
  const [editingRow, setEditingRow] = useState(null);
  const navigate = useNavigate();
  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500/70 dark:focus:ring-indigo-500/20";

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
    setActiveRoute(route);
  };

  const handleLogout = () => {
    setActiveRoute("dashboard");
    navigate("/");
  };

  const openEditor = (row) => {
    setEditingRow({
      ...row,
      unitCost: row.unitCost.toString(),
      onHand: row.onHand.toString(),
      reserved: row.reserved.toString(),
    });
  };

  const closeEditor = () => {
    setEditingRow(null);
  };

  const handleEditorChange = (field, value) => {
    setEditingRow((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveRow = (event) => {
    event.preventDefault();
    if (!editingRow) return;

    const normalizedUnitCost = Math.max(0, Number(editingRow.unitCost) || 0);
    const normalizedOnHand = Math.max(0, Number(editingRow.onHand) || 0);
    const normalizedReserved = Math.max(0, Number(editingRow.reserved) || 0);
    const safeReserved = Math.min(normalizedReserved, normalizedOnHand);

    const updatedRow = {
      id: editingRow.id,
      product: editingRow.product.trim() || "Untitled",
      currency: editingRow.currency.trim() || "Rs",
      unitCost: normalizedUnitCost,
      onHand: normalizedOnHand,
      reserved: safeReserved,
    };

    setInventory((prev) => prev.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
    setEditingRow(null);
  };

  const freeToUse = (item) => Math.max(item.onHand - item.reserved, 0);

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
          
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Stock</h1>
          <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Review current balances and launch manual adjustments when the physical count drifts.
          </p>
        </header>

        <section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70 dark:shadow-slate-950/30">
          <header className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Current Inventory
              </h2>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500">
              <PackageSearch size={18} />
            </span>
          </header>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] items-center bg-slate-100/70 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              <span>Product</span>
              <span>Per Unit Cost</span>
              <span>On Hand</span>
              <span>Free To Use</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {inventory.map((row) => (
                <div key={row.id} className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-medium text-slate-900 dark:text-white">{row.product}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {row.unitCost} {row.currency}
                  </span>
                  <span>{row.onHand}</span>
                  <span className="font-semibold text-emerald-500">{freeToUse(row)}</span>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openEditor(row)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>

      {editingRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeEditor}
          />
          <form
            onSubmit={handleSaveRow}
            className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-2xl shadow-slate-400/40 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-slate-900/50"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Edit Product
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {editingRow.product || "Untitled"}
                </h3>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">ID · {editingRow.id}</p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
              >
                Close
              </button>
            </header>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Product
                <input
                  value={editingRow.product}
                  onChange={(event) => handleEditorChange("product", event.target.value)}
                  className={inputStyles}
                  placeholder="Product name"
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Currency
                <input
                  value={editingRow.currency}
                  onChange={(event) => handleEditorChange("currency", event.target.value)}
                  className={inputStyles}
                  placeholder="Rs"
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Per Unit Cost
                <input
                  value={editingRow.unitCost}
                  onChange={(event) => handleEditorChange("unitCost", event.target.value)}
                  type="number"
                  min="0"
                  className={inputStyles}
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                On Hand
                <input
                  value={editingRow.onHand}
                  onChange={(event) => handleEditorChange("onHand", event.target.value)}
                  type="number"
                  min="0"
                  className={inputStyles}
                />
              </label>
              <label className="space-y-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 sm:col-span-2">
                Reserved
                <input
                  value={editingRow.reserved}
                  onChange={(event) => handleEditorChange("reserved", event.target.value)}
                  type="number"
                  min="0"
                  className={inputStyles}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:translate-y-[-1px] hover:from-indigo-500 hover:to-purple-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
