import { setOrderFromForm } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";

const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"] as const;

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("orders")
    .select("id, total_amount, status, created_at, paystack_reference, users(name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--text)]">Orders</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Track fulfillment from payment to delivery.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[#fafafa] text-left text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Paystack</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {(rows ?? []).map((o) => {
              const u = o.users as { name?: string; email?: string } | null;
              return (
                <tr key={o.id}>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {u?.name}
                    <br />
                    <span className="text-xs text-[var(--muted)]">{u?.email}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    GHS {Number(o.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{o.paystack_reference}</td>
                  <td className="px-4 py-3 capitalize">{o.status}</td>
                  <td className="px-4 py-3">
                    <form action={setOrderFromForm} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
