import type { ReactNode } from "react";

type KpiColor = "blue" | "green" | "red" | "yellow" | "slate";

const colorMap: Record<KpiColor, { ring: string; accent: string; change: string }> = {
  blue: { ring: "ring-slate-950/5", accent: "bg-[#1e3a5f]/10", change: "text-[#1e3a5f]" },
  green: { ring: "ring-emerald-900/5", accent: "bg-emerald-500/10", change: "text-emerald-700" },
  red: { ring: "ring-rose-900/5", accent: "bg-rose-500/10", change: "text-rose-700" },
  yellow: { ring: "ring-amber-900/5", accent: "bg-amber-500/10", change: "text-amber-800" },
  slate: { ring: "ring-slate-950/5", accent: "bg-slate-500/10", change: "text-slate-600" },
};

export function KPICard({
  title,
  value,
  subtitle,
  change,
  icon,
  color = "slate",
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  change?: number;
  icon?: ReactNode;
  color?: KpiColor;
}) {
  const c = colorMap[color];
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ${c.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-3 font-serif text-3xl font-semibold tabular-nums text-slate-900">
            {value}
          </p>
          {subtitle ? <p className="mt-2 text-xs text-slate-500">{subtitle}</p> : null}
          {typeof change === "number" ? (
            <p className={`mt-2 text-xs font-semibold ${c.change}`}>
              {change >= 0 ? "+" : ""}
              {change}% vs prior period
            </p>
          ) : null}
        </div>
        {icon ? (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.accent} text-slate-700`}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${c.accent}`} />
    </div>
  );
}
