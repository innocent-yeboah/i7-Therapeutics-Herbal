import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

function formatGhs(n: number) {
  return `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminHome() {
  const supabase = await createClient();
  const d = await getAdminDashboardData(supabase);
  const { kpis, chartSeries, topServices, statusBreakdown, lowProducts, recentOrders, upcomingAppts } =
    d;
  const maxRev = Math.max(...chartSeries.map((c) => c.revenue), 1);
  const statusEntries = Object.entries(statusBreakdown).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...statusEntries.map(([, n]) => n), 1);

  const alertCount = (kpis.contactAttention > 0 ? 1 : 0) + (kpis.webhookOpen > 0 ? 1 : 0);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700/90">
            Command center
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Operations overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Real-time visibility across revenue, fulfillment, bookings, inventory, and client
            touchpoints. Aligned to Ghana business hours (Africa/Accra).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/reports"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Full analytics
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition hover:bg-[#162d49]"
          >
            Manage orders
          </Link>
        </div>
      </header>

      {alertCount > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-rose-950">Executive action items</p>
              <ul className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-rose-900">
                {kpis.contactAttention > 0 && (
                  <li>
                    <Link href="/admin/contacts" className="font-medium underline decoration-rose-400">
                      {kpis.contactAttention} inbox / lead{kpis.contactAttention === 1 ? "" : "s"}
                    </Link>
                    <span className="text-rose-800/90"> need follow-up</span>
                  </li>
                )}
                {kpis.webhookOpen > 0 && (
                  <li>
                    <Link href="/admin/webhook-failures" className="font-medium underline decoration-rose-400">
                      {kpis.webhookOpen} payment webhook{kpis.webhookOpen === 1 ? "" : "s"}
                    </Link>
                    <span className="text-rose-800/90"> require retry</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5 transition hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lifetime revenue</p>
          <p className="mt-3 font-serif text-3xl font-semibold text-slate-900 tabular-nums">
            {formatGhs(kpis.revenueLifetime)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Paid & fulfilled pipeline orders</p>
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last 7 days</p>
          <p className="mt-3 font-serif text-3xl font-semibold text-slate-900 tabular-nums">
            {formatGhs(kpis.revenue7d)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Recognized revenue by order date</p>
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#1e3a5f]/10" />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fulfillment queue</p>
          <div className="mt-3 flex flex-wrap items-baseline gap-4">
            <div>
              <p className="font-serif text-3xl font-semibold text-amber-700 tabular-nums">{kpis.pendingPayment}</p>
              <p className="text-xs text-slate-500">Pending payment</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="font-serif text-3xl font-semibold text-emerald-800 tabular-nums">{kpis.fulfilling}</p>
              <p className="text-xs text-slate-500">Active pipeline</p>
            </div>
          </div>
          <Link href="/admin/orders" className="mt-4 inline-block text-xs font-bold text-[#1e3a5f] hover:underline">
            Open order desk →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bookings & clients</p>
          <div className="mt-3 flex flex-wrap gap-6">
            <div>
              <p className="font-serif text-2xl font-semibold text-slate-900">{kpis.apptPending}</p>
              <p className="text-xs text-slate-500">Pending confirmations</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-slate-900">{kpis.customerTotal}</p>
              <p className="text-xs text-slate-500">Registered clients</p>
            </div>
          </div>
          <Link href="/admin/appointments" className="mt-4 inline-block text-xs font-bold text-[#1e3a5f] hover:underline">
            Scheduling →
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-slate-900">Revenue trend</h2>
              <p className="text-xs text-slate-500">Daily recognized revenue · trailing 7 days</p>
            </div>
          </div>
          <div className="mt-6 flex h-52 items-end gap-2 sm:gap-3">
            {chartSeries.map((pt) => {
              const h = Math.round((pt.revenue / maxRev) * 100);
              return (
                <div key={pt.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className="w-full max-w-[3.5rem] rounded-t-md bg-gradient-to-t from-emerald-800/90 to-emerald-500/90 transition-all"
                      style={{ height: `${Math.max(h, pt.revenue > 0 ? 8 : 4)}%` }}
                      title={`${pt.label}: ${formatGhs(pt.revenue)}`}
                    />
                  </div>
                  <span className="text-center text-[10px] font-medium text-slate-500 sm:text-xs">{pt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
          <h2 className="border-b border-slate-100 pb-4 font-serif text-lg font-semibold text-slate-900">
            Order status mix
          </h2>
          <ul className="mt-5 space-y-4">
            {statusEntries.length === 0 ? (
              <li className="text-sm text-slate-500">No orders recorded yet.</li>
            ) : (
              statusEntries.map(([status, count]) => (
                <li key={status}>
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-slate-700">{status}</span>
                    <span className="font-mono text-slate-500">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1e3a5f]"
                      style={{ width: `${Math.round((count / maxStatus) * 100)}%` }}
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Today &amp; ahead</h2>
            <Link href="/admin/appointments" className="text-xs font-bold text-emerald-800 hover:underline">
              Calendar
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {(upcomingAppts ?? []).length === 0 ? (
              <li className="py-8 text-center text-sm text-slate-500">No upcoming sessions on file.</li>
            ) : (
              (upcomingAppts ?? []).map((a) => {
                const svc = a.services as { name?: string } | null;
                const u = a.users as { name?: string; email?: string } | null;
                return (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{svc?.name ?? "Service"}</p>
                      <p className="text-xs text-slate-500">
                        {u?.name} · {a.appointment_date} {a.appointment_time}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-slate-700">
                      {a.status}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-950/5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Service demand</h2>
            <span className="text-xs font-medium text-slate-400">All-time volume</span>
          </div>
          <ul className="mt-4 space-y-3">
            {topServices.length === 0 ? (
              <li className="text-sm text-slate-500">Bookings will populate as clients schedule.</li>
            ) : (
              topServices.map((s, i) => (
                <li key={s.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                      {i + 1}
                    </span>
                    {s.name}
                  </span>
                  <span className="font-mono text-slate-500">{s.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-950/5">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-[#1e3a5f] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentOrders ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  (recentOrders ?? []).map((o) => {
                    const u = o.users as { name?: string; email?: string } | null;
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-3">
                          <p className="font-medium text-slate-900">{u?.name || "—"}</p>
                          <p className="text-xs text-slate-500">{u?.email}</p>
                        </td>
                        <td className="px-6 py-3 font-semibold tabular-nums text-slate-800">
                          {formatGhs(Number(o.total_amount))}
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-500">
                          {new Date(o.created_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/80 to-white p-6 shadow-sm ring-1 ring-amber-900/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-amber-950">Inventory risk</h2>
              <p className="mt-1 text-xs text-amber-900/80">
                SKUs at or below {LOW_STOCK_THRESHOLD} units · procurement signal
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 tabular-nums">
              {kpis.lowStockCount} SKU{kpis.lowStockCount === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="mt-5 space-y-2">
            {(lowProducts ?? []).length === 0 ? (
              <li className="py-6 text-center text-sm text-amber-900/80">All SKUs above threshold.</li>
            ) : (
              (lowProducts ?? []).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-amber-100/80 bg-white/90 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-amber-950">{p.name}</span>
                  <span className="font-mono text-amber-900">{p.stock_quantity} left</span>
                </li>
              ))
            )}
          </ul>
          <Link
            href="/admin/products"
            className="mt-5 inline-flex text-xs font-bold text-amber-950 underline decoration-amber-400 hover:decoration-amber-600"
          >
            Inventory control →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
        Operational data reflects your Supabase project. For tax and statutory reporting, reconcile with
        finance systems.
      </footer>
    </div>
  );
}
