import React, { useMemo } from "react";
import { Download, Truck } from "lucide-react";
import ActionCard from "../components/ActionCard";

const deliveriesMock = {
  toDeliver: 4,
  late: 1,
  waiting: 2,
  future: 6,
};

export default function Dashboard({ pendingReceipts = 0, onViewReceipts }) {
  const cardConfig = useMemo(
    () => [
      {
        key: "receipts",
        title: "Incoming Receipts",
        icon: Download,
        chip: "Inbound Flow",
        subtitle: "Track docks, ASN, and late arrivals",
        primary: `${pendingReceipts} To Receive`,
        gradient: "bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500",
        stats: [
          {
            label: "Late",
            value: Math.max(1, Math.floor(pendingReceipts / 3)),
            className: "text-red-500",
          },
          {
            label: "Future Operations",
            value: Math.max(pendingReceipts + 2, 6),
            className: "text-slate-500 dark:text-slate-300",
          },
        ],
        onPrimaryAction: onViewReceipts,
      },
      {
        key: "deliveries",
        title: "Delivery Orders",
        icon: Truck,
        chip: "Outbound Flow",
        subtitle: "Monitor pick, pack, and carrier handoffs",
        primary: `${deliveriesMock.toDeliver} To Deliver`,
        gradient:
          "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400",
        stats: [
          {
            label: "Late",
            value: deliveriesMock.late,
            className: "text-red-500",
          },
          {
            label: "Waiting",
            value: deliveriesMock.waiting,
            className: "text-orange-400",
          },
          {
            label: "Future Operations",
            value: deliveriesMock.future,
            className: "text-slate-500 dark:text-slate-300",
          },
        ],
      },
    ],
    [pendingReceipts, onViewReceipts]
  );

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
          Flow Control
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
          Inbound & Outbound Operations
        </h1>
        <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
          Focus mode view showing only the mission-critical flows. Track
          receipts and deliveries with perfect clarity.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {cardConfig.map((card) => (
          <div key={card.key} className="flex">
            <ActionCard
              title={card.title}
              Icon={card.icon}
              chipLabel={card.chip}
              subtitle={card.subtitle}
              primaryLabel={card.primary}
              primaryGradient={card.gradient}
              stats={card.stats}
              onPrimaryAction={card.onPrimaryAction}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
