import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export default async function AdminHome() {
  const supabase = await createClient();
  const [
    { count: apptCount },
    { count: orderCount },
    { count: customerCount },
    { data: low },
    { count: contactAttention },
    { count: webhookOpen },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id, name, stock_quantity")
      .lte("stock_quantity", LOW_STOCK_THRESHOLD)
      .order("stock_quantity", { ascending: true }),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "email_failed"]),
    supabase.from("webhook_failures").select("*", { count: "exact", head: true }).is("resolved_at", null),
  ]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-3xl text-[var(--text)]">Operating snapshot</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Monitor sessions, orders, and stock from one calm workspace.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-[var(--muted)]">Appointments</p>
          <p className="mt-2 font-serif text-3xl text-[var(--secondary)]">{apptCount ?? 0}</p>
          <Link href="/admin/appointments" className="mt-2 inline-block text-xs font-semibold text-[var(--primary)]">
            Manage →
          </Link>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-[var(--muted)]">Orders</p>
          <p className="mt-2 font-serif text-3xl text-[var(--secondary)]">{orderCount ?? 0}</p>
          <Link href="/admin/orders" className="mt-2 inline-block text-xs font-semibold text-[var(--primary)]">
            Fulfill →
          </Link>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <p className="text-xs uppercase text-[var(--muted)]">Clients</p>
          <p className="mt-2 font-serif text-3xl text-[var(--secondary)]">{customerCount ?? 0}</p>
          <Link href="/admin/customers" className="mt-2 inline-block text-xs font-semibold text-[var(--primary)]">
            Directory →
          </Link>
        </div>
      </div>

      {(contactAttention ?? 0) > 0 || (webhookOpen ?? 0) > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <h2 className="font-serif text-xl text-rose-900">Action queue</h2>
          <ul className="mt-3 space-y-2 text-sm text-rose-950">
            {(contactAttention ?? 0) > 0 && (
              <li>
                <Link href="/admin/contacts" className="font-semibold underline">
                  {contactAttention} contact message{(contactAttention ?? 0) === 1 ? "" : "s"}
                </Link>{" "}
                pending staff email or failed delivery — review in Contacts.
              </li>
            )}
            {(webhookOpen ?? 0) > 0 && (
              <li>
                <Link href="/admin/webhook-failures" className="font-semibold underline">
                  {webhookOpen} Paystack webhook{(webhookOpen ?? 0) === 1 ? "" : "s"}
                </Link>{" "}
                did not complete fulfillment — retry when stock and data are fixed.
              </li>
            )}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-serif text-xl text-amber-900">Low stock alerts</h2>
        <p className="mt-1 text-xs text-amber-800">
          Threshold: {LOW_STOCK_THRESHOLD} units. Rebalance before shelves go quiet.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {(low ?? []).length === 0 && (
            <li className="text-amber-800">All products are above the alert level.</li>
          )}
          {(low ?? []).map((p) => (
            <li key={p.id} className="flex justify-between gap-4">
              <span className="font-medium text-amber-950">{p.name}</span>
              <span className="font-mono text-amber-900">{p.stock_quantity} left</span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/inventory"
          className="mt-4 inline-block text-xs font-semibold text-amber-900 underline"
        >
          Open inventory tracker
        </Link>
      </section>
    </div>
  );
}
