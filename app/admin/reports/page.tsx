import { createClient } from "@/lib/supabase/server";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("total_amount, status")
    .in("status", ["paid", "processing", "shipped", "delivered"]);

  const revenue =
    orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  const { data: appts } = await supabase
    .from("appointments")
    .select("service_id, services(name)");

  const serviceCounts = new Map<string, number>();
  (appts ?? []).forEach((a) => {
    const sid = a.service_id as string;
    serviceCounts.set(sid, (serviceCounts.get(sid) ?? 0) + 1);
  });

  const serviceNames = new Map<string, string>();
  (appts ?? []).forEach((a) => {
    const s = a.services as { name?: string } | null;
    if (s?.name) serviceNames.set(a.service_id as string, s.name);
  });

  const topServices = [...serviceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      name: serviceNames.get(id) ?? "Service",
      count,
    }));

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("id")
    .in("status", ["paid", "processing", "shipped", "delivered"]);

  const paidIds = (paidOrders ?? []).map((o) => o.id);
  let topProducts: { name: string; qty: number }[] = [];
  if (paidIds.length) {
    const { data: items } = await supabase
      .from("order_items")
      .select("quantity, products(name)")
      .in("order_id", paidIds);

    const pm = new Map<string, { name: string; qty: number }>();
    (items ?? []).forEach((row) => {
      const p = row.products as { name?: string } | null;
      const name = p?.name ?? "Product";
      const prev = pm.get(name) ?? { name, qty: 0 };
      prev.qty += row.quantity;
      pm.set(name, prev);
    });
    topProducts = [...pm.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-3xl text-[var(--text)]">Reports</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Revenue reflects successful Paystack settlements and downstream fulfillment stages.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl text-[var(--text)]">Revenue</h2>
        <p className="mt-4 font-serif text-4xl text-[var(--secondary)]">
          GHS {revenue.toFixed(2)}
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Sum of order totals with status paid, processing, shipped, or delivered.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[var(--text)]">Popular services</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {topServices.length === 0 && (
              <li className="text-[var(--muted)]">Not enough booking data yet.</li>
            )}
            {topServices.map((s) => (
              <li key={s.name} className="flex justify-between">
                <span>{s.name}</span>
                <span className="font-mono text-[var(--muted)]">{s.count} bookings</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[var(--text)]">Popular products</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {topProducts.length === 0 && (
              <li className="text-[var(--muted)]">No paid orders with line items yet.</li>
            )}
            {topProducts.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <span className="font-mono text-[var(--muted)]">{p.qty} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
