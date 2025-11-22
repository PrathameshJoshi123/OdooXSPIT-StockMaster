import React from "react";
import { Clock } from "lucide-react";

export default function ActionCard({
  title,
  Icon,
  primaryLabel,
  primaryGradient,
  subtitle,
  stats,
  chipLabel,
  className = "",
}) {
  return (
    <div className={`group relative h-full w-full overflow-hidden rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl shadow-slate-200 transition hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-slate-900/40 ${className}`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%)] transition" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              <Clock size={12} />
              {chipLabel}
            </span>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-800 dark:bg-slate-800/50 dark:text-white">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          <button
            className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:translate-y-0.5 ${primaryGradient}`}
          >
            {primaryLabel}
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[140px] rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className={`mt-2 text-lg font-semibold ${stat.className}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
