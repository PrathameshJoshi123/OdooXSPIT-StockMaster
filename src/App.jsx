import React, { useState, useEffect, useMemo } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import ReceiptsList from "./pages/ReceiptsList";
import ReceiptsDetail from "./pages/ReceiptsDetail";
import Warehouse from "./pages/Warehouse";
import Location from "./pages/Location";

const baseReceipts = [
  {
    id: "wh-in-0001",
    sequence: 1,
    reference: "WH/IN/0001",
    from: "Azure Interior",
    to: "WH/Stock",
    scheduleDate: "2025-11-24",
    status: "Draft",
    sourceDocument: "BILL/2025/0009",
    operationType: "Receipts",
    responsible: "Admin",
    lines: [
      {
        id: "line-1",
        product: "Modular Desk Frames",
        uom: "Units",
        scheduledQty: 120,
        doneQty: 0,
      },
      {
        id: "line-2",
        product: "Cable Harness Kits",
        uom: "Units",
        scheduledQty: 200,
        doneQty: 0,
      },
    ],
  },
  {
    id: "wh-in-0002",
    sequence: 2,
    reference: "WH/IN/0002",
    from: "Gemini Furniture",
    to: "WH/Input",
    scheduleDate: "2025-11-25",
    status: "Ready",
    sourceDocument: "PO/2025/0102",
    operationType: "Receipts",
    responsible: "Admin",
    lines: [
      {
        id: "line-3",
        product: "Walnut Panels",
        uom: "Units",
        scheduledQty: 80,
        doneQty: 40,
      },
    ],
  },
  {
    id: "wh-in-0003",
    sequence: 3,
    reference: "WH/IN/0003",
    from: "TexiCo Imports",
    to: "WH/Quality",
    scheduleDate: "2025-11-21",
    status: "Done",
    sourceDocument: "BILL/2025/0025",
    operationType: "Receipts",
    responsible: "Admin",
    lines: [
      {
        id: "line-4",
        product: "Fabric Rolls",
        uom: "Kg",
        scheduledQty: 300,
        doneQty: 300,
      },
    ],
  },
];

function Placeholder({ title, description }) {
  return (
    <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600">
        Module Preview
      </p>
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h1>
      <p className="text-base text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </main>
  );
}

const vendorOptions = [
  "Azure Interior",
  "Gemini Furniture",
  "TexiCo Imports",
  "Alto Office",
];

const formatReference = (sequence) =>
  `WH/IN/${sequence.toString().padStart(4, "0")}`;

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("stockmaster-theme") || "light";
  });
  const [receipts, setReceipts] = useState(baseReceipts);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("stockmaster-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const getNextSequence = () =>
    receipts.reduce((max, receipt) => Math.max(max, receipt.sequence), 0) + 1;

  const handleCreateReceipt = () => {
    const sequence = getNextSequence();
    const newReceipt = {
      id: `wh-in-${sequence.toString().padStart(4, "0")}`,
      sequence,
      reference: formatReference(sequence),
      from: vendorOptions[0],
      to: "WH/Stock",
      scheduleDate: new Date().toISOString().slice(0, 10),
      status: "Draft",
      sourceDocument: "--",
      operationType: "Receipts",
      responsible: "Admin",
      lines: [
        {
          id: `line-${Date.now()}`,
          product: "New Product",
          uom: "Units",
          scheduledQty: 0,
          doneQty: 0,
        },
      ],
    };
    setReceipts((prev) => [...prev, newReceipt]);
    return newReceipt;
  };

  const handleUpdateReceipt = (updated) => {
    setReceipts((prev) =>
      prev.map((receipt) => (receipt.id === updated.id ? updated : receipt))
    );
  };

  const activeRoute = location.pathname;
  const pendingReceipts = useMemo(
    () => receipts.filter((receipt) => receipt.status !== "Done").length,
    [receipts]
  );

  const navigateToReceipts = () => navigate("/operations/receipts");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 mx-auto h-72 max-w-5xl rounded-full bg-gradient-to-br from-indigo-200 via-sky-100 to-white blur-3xl opacity-70 dark:from-indigo-900 dark:via-slate-900 dark:to-transparent" />
      <NavBar
        activeRoute={activeRoute}
        onNavigate={(path) => navigate(path)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              pendingReceipts={pendingReceipts}
              onViewReceipts={navigateToReceipts}
            />
          }
        />
        <Route
          path="/operations/receipts"
          element={
            <ReceiptsList
              receipts={receipts}
              onCreateReceipt={handleCreateReceipt}
            />
          }
        />
        <Route
          path="/operations/receipts/:id"
          element={
            <ReceiptsDetail
              receipts={receipts}
              onUpdateReceipt={handleUpdateReceipt}
              vendors={vendorOptions}
            />
          }
        />
        <Route path="/settings/warehouse" element={<Warehouse />} />
        <Route path="/settings/location" element={<Location />} />
        <Route
          path="/operations/deliveries"
          element={
            <Placeholder
              title="Deliveries overview"
              description="Connect carrier data to surface delivery waves, delays, and assignments."
            />
          }
        />
        <Route
          path="/operations/adjustments"
          element={
            <Placeholder
              title="Inventory adjustments"
              description="Track damage, shrink, and recounts once the API is wired up."
            />
          }
        />
        <Route
          path="/stock"
          element={
            <Placeholder
              title="Stock view"
              description="Plug in your stock valuation or bin report here for quick audits."
            />
          }
        />
        <Route
          path="/history"
          element={
            <Placeholder
              title="Move history"
              description="Replay every pick, pack, and transfer when this module goes live."
            />
          }
        />
        <Route
          path="*"
          element={
            <Placeholder
              title="Coming soon"
              description="Select an available module from the navigation to begin."
            />
          }
        />
      </Routes>
    </div>
  );
}
