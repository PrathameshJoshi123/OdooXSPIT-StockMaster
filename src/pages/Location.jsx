import React from "react";

function FormField({ label, placeholder, multiline = false, type = "text" }) {
  const inputStyles =
    "w-full rounded-2xl border border-slate-200 bg-white/40 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-0 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500";

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
        />
      ) : (
        <input className={inputStyles} placeholder={placeholder} type={type} />
      )}
    </label>
  );
}

export default function Location() {
  return (
    <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70 dark:shadow-black/30">
        <header className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Dashboard · Operations · Products · Move History · Settings
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Location
            </h1>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500">
            #
          </span>
        </header>

        <div className="mt-8 grid gap-6">
          <FormField label="Name" placeholder="Inbound Dock A" />
          <FormField label="Short Code" placeholder="IDA" />
          <FormField label="Warehouse" placeholder="Select linked warehouse" />
        </div>

        <p className="mt-10 text-sm text-slate-400 dark:text-slate-500">
          This holds the multiple locations of warehouses, rooms, and storage
          areas so pickers always know exactly where to move inventory.
        </p>
      </section>
    </main>
  );
}
