import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Truck, Package, AlertTriangle, ArrowRightLeft, ChevronDown } from "lucide-react";
import NavBar from "../components/NavBar";
import ActionCard from "../components/ActionCard";

const mockData = {
  kpis: {
    totalProducts: 1250,
    lowStock: 15,
    pendingReceipts: 8,
    pendingDeliveries: 12,
    internalTransfers: 3,
  },
  receipts: {
    toReceive: 4,
    late: 1,
    future: 6,
  },
  deliveries: {
    toDeliver: 4,
    late: 1,
    waiting: 2,
    future: 6,
  },
};

const kpiConfig = [
  {
    key: "totalProducts",
    title: "Total Products in Stock",
    value: mockData.kpis.totalProducts,
    icon: Package,
    color: "text-blue-600",
  },
  {
    key: "lowStock",
    title: "Low Stock / Out of Stock",
    value: mockData.kpis.lowStock,
    icon: AlertTriangle,
    color: "text-red-500",
  },
  {
    key: "pendingReceipts",
    title: "Pending Receipts",
    value: mockData.kpis.pendingReceipts,
    icon: Download,
    color: "text-green-600",
  },
  {
    key: "pendingDeliveries",
    title: "Pending Deliveries",
    value: mockData.kpis.pendingDeliveries,
    icon: Truck,
    color: "text-orange-500",
  },
  {
    key: "internalTransfers",
    title: "Internal Transfers Scheduled",
    value: mockData.kpis.internalTransfers,
    icon: ArrowRightLeft,
    color: "text-purple-600",
  },
];

const cardConfig = [
  {
    key: "receipts",
    title: "Incoming Receipts",
    icon: Download,
    chip: "Inbound Flow",
    subtitle: "Track docks, ASN, and late arrivals",
    primary: `${mockData.receipts.toReceive} To Receive`,
    gradient: "bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500",
    stats: [
      {
        label: "Late",
        value: mockData.receipts.late,
        className: "text-red-500",
      },
      {
        label: "Future Operations",
        value: mockData.receipts.future,
        className: "text-slate-500 dark:text-slate-300",
      },
    ],
    type: "Receipts",
    status: "Ready",
    warehouse: "Main Warehouse",
    category: "Electronics",
  },
  {
    key: "deliveries",
    title: "Delivery Orders",
    icon: Truck,
    chip: "Outbound Flow",
    subtitle: "Monitor pick, pack, and carrier handoffs",
    primary: `${mockData.deliveries.toDeliver} To Deliver`,
    gradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400",
    stats: [
      {
        label: "Late",
        value: mockData.deliveries.late,
        className: "text-red-500",
      },
      {
        label: "Waiting",
        value: mockData.deliveries.waiting,
        className: "text-orange-400",
      },
      {
        label: "Future Operations",
        value: mockData.deliveries.future,
        className: "text-slate-500 dark:text-slate-300",
      },
    ],
    type: "Delivery",
    status: "Waiting",
    warehouse: "Secondary Warehouse",
    category: "Clothing",
  },
  // Add more mock cards for variety
  {
    key: "internal",
    title: "Internal Transfers",
    icon: ArrowRightLeft,
    chip: "Internal Flow",
    subtitle: "Manage warehouse-to-warehouse moves",
    primary: "2 To Transfer",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500",
    stats: [
      {
        label: "Scheduled",
        value: 2,
        className: "text-purple-500",
      },
      {
        label: "In Progress",
        value: 1,
        className: "text-blue-500",
      },
    ],
    type: "Internal",
    status: "Draft",
    warehouse: "Main Warehouse",
    category: "Furniture",
  },
  {
    key: "adjustments",
    title: "Inventory Adjustments",
    icon: AlertTriangle,
    chip: "Adjustment Flow",
    subtitle: "Handle stock corrections and audits",
    primary: "3 Pending",
    gradient: "bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500",
    stats: [
      {
        label: "Approved",
        value: 1,
        className: "text-green-500",
      },
      {
        label: "Rejected",
        value: 0,
        className: "text-gray-500",
      },
    ],
    type: "Adjustments",
    status: "Done",
    warehouse: "Secondary Warehouse",
    category: "Electronics",
  },
];

export default function Dashboard({ theme, onToggleTheme }) {
  const [activeRoute, setActiveRoute] = useState("dashboard");
  const [filters, setFilters] = useState({
    documentType: "",
    status: "",
    warehouse: "",
    category: "",
  });
  const navigate = useNavigate();

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
    setActiveRoute(route);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    setActiveRoute("dashboard");
    navigate("/");
  };

  const filteredCards = cardConfig.filter((card) => {
    return (
      (!filters.documentType || card.type === filters.documentType) &&
      (!filters.status || card.status === filters.status) &&
      (!filters.warehouse || card.warehouse === filters.warehouse) &&
      (!filters.category || card.category === filters.category)
    );
  });

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 transition dark:bg-slate-950 dark:text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-indigo-600 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-purple-700 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500 blur-[110px]" />
      </div>

      <NavBar
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar">
        <header className="max-w-3xl">
         
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
            Inventory Operations
          </h1>
          <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
            Track receipts and deliveries with perfect clarity.
          </p>
        </header>

        {/* KPI Section */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {kpiConfig.map((kpi) => (
            <div key={kpi.key} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50 min-h-[6rem] flex items-center">
              <div className="flex items-center gap-3">
                <kpi.icon size={24} className={kpi.color} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {kpi.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Filters Section */}
        <section className="flex flex-wrap gap-4">
          <div className="relative">
            <select
              value={filters.documentType}
              onChange={(e) => handleFilterChange("documentType", e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 pr-12 text-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <option value="">All Document Types</option>
              <option value="Receipts">Receipts</option>
              <option value="Delivery">Delivery</option>
              <option value="Internal">Internal</option>
              <option value="Adjustments">Adjustments</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 dark:text-slate-300"
            />
          </div>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 pr-12 text-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 dark:text-slate-300"
            />
          </div>
          <div className="relative">
            <select
              value={filters.warehouse}
              onChange={(e) => handleFilterChange("warehouse", e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 pr-12 text-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <option value="">All Warehouses</option>
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="Secondary Warehouse">Secondary Warehouse</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 dark:text-slate-300"
            />
          </div>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 pr-12 text-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Furniture">Furniture</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 dark:text-slate-300"
            />
          </div>
        </section>

        <div className="grid auto-rows-fr gap-6 md:grid-cols-2 flex-1">
          {filteredCards.map((card) => (
            <div key={card.key} className="flex h-full">
              <ActionCard
                title={card.title}
                Icon={card.icon}
                chipLabel={card.chip}
                subtitle={card.subtitle}
                primaryLabel={card.primary}
                primaryGradient={card.gradient}
                stats={card.stats}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
