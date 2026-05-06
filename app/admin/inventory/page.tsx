import { setStockFromForm } from "@/app/actions/admin";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--text)]">Inventory tracker</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Adjust counts after restocks. Items at or below {LOW_STOCK_THRESHOLD} units appear in the
        admin overview banner.
      </p>
      <div className="mt-8 space-y-4">
        {(products ?? []).map((p) => (
          <div
            key={p.id}
            className={`flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
              p.stock_quantity <= LOW_STOCK_THRESHOLD
                ? "border-amber-300"
                : "border-[var(--border)]"
            }`}
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-[var(--muted)]">{p.description}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--secondary)]">
                Current stock: {p.stock_quantity}
              </p>
            </div>
            <form action={setStockFromForm} className="flex items-center gap-2">
              <input type="hidden" name="id" value={p.id} />
              <input
                type="number"
                name="quantity"
                min={0}
                defaultValue={p.stock_quantity}
                className="w-28 rounded-lg border border-[var(--border)] px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Update
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
