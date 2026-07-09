export type ChartPoint = {
  label: string;
  value: number;
  secondary?: number;
};

export function BarChart({
  data,
  valueLabel = "Value",
  formatValue,
  heightClass = "h-52",
}: {
  data: ChartPoint[];
  valueLabel?: string;
  formatValue?: (n: number) => string;
  heightClass?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue ?? ((n: number) => String(n));

  return (
    <div className={`flex ${heightClass} items-end gap-2 sm:gap-3`}>
      {data.map((pt) => {
        const h = Math.round((pt.value / max) * 100);
        return (
          <div key={pt.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[3.5rem] rounded-t-md bg-gradient-to-t from-emerald-800/90 to-emerald-500/90"
                style={{ height: `${Math.max(h, pt.value > 0 ? 8 : 4)}%` }}
                title={`${pt.label}: ${fmt(pt.value)}`}
                role="img"
                aria-label={`${pt.label} ${valueLabel} ${fmt(pt.value)}`}
              />
            </div>
            <span className="text-center text-[10px] font-medium text-slate-500 sm:text-xs">
              {pt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function HorizontalBarList({
  items,
  formatValue,
}: {
  items: { label: string; value: number }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const fmt = formatValue ?? ((n: number) => String(n));

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No data yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex justify-between text-sm">
            <span className="capitalize text-slate-700">{item.label}</span>
            <span className="font-mono text-slate-500">{fmt(item.value)}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1e3a5f]"
              style={{ width: `${Math.round((item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
