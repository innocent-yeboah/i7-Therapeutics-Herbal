import { AdminHeader } from "@/components/admin/admin-header";
import { BarChart, HorizontalBarList } from "@/components/admin/chart";
import { KPICard } from "@/components/admin/kpi-card";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";

function formatGhs(n: number) {
  return `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const dashboard = await getAdminDashboardData(supabase);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, status, created_at, users(name, email)")
    .order("created_at", { ascending: false });

  const paidOrders = (orders ?? []).filter((o) =>
    ["paid", "processing", "shipped", "delivered"].includes(o.status)
  );

  const csvRows = paidOrders.map((o) => {
    const u = o.users as { name?: string; email?: string } | null;
    return {
      date: new Date(o.created_at).toISOString(),
      client: u?.name ?? "",
      email: u?.email ?? "",
      total: Number(o.total_amount).toFixed(2),
      status: o.status,
    };
  });

  return (
    <div>
      <AdminHeader
        title="Reports"
        subtitle="Revenue, bookings, and product performance analytics."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Lifetime revenue"
          value={formatGhs(dashboard.kpis.revenueLifetime)}
          color="green"
        />
        <KPICard
          title="Last 7 days"
          value={formatGhs(dashboard.kpis.revenue7d)}
          color="blue"
        />
        <KPICard title="Total clients" value={dashboard.kpis.customerTotal} color="slate" />
        <KPICard title="Total appointments" value={dashboard.kpis.apptTotal} color="yellow" />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Weekly revenue</h2>
          <div className="mt-6">
            <BarChart
              data={dashboard.chartSeries.map((p) => ({ label: p.label, value: p.revenue }))}
              formatValue={formatGhs}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Order status mix</h2>
          <div className="mt-6">
            <HorizontalBarList
              items={Object.entries(dashboard.statusBreakdown).map(([label, value]) => ({
                label,
                value,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Popular services</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {dashboard.topServices.length === 0 ? (
              <li className="text-slate-500">Not enough booking data yet.</li>
            ) : (
              dashboard.topServices.map((s) => (
                <li key={s.name} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="font-mono text-slate-500">{s.count} bookings</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Export orders</h2>
            <ExportCsvButton
              filename={`revenue-orders-${new Date().toISOString().slice(0, 10)}.csv`}
              rows={csvRows}
              columns={[
                { key: "date", header: "Date" },
                { key: "client", header: "Client" },
                { key: "email", header: "Email" },
                { key: "total", header: "Total (GHS)" },
                { key: "status", header: "Status" },
              ]}
            />
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {paidOrders.length} paid or fulfilled orders included in lifetime revenue.
          </p>
        </div>
      </section>
    </div>
  );
}
