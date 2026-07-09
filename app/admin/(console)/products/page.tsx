import Link from "next/link";
import {
  deleteProductFromForm,
  upsertProductFromForm,
} from "@/app/actions/admin-crud";
import { setStockFromForm } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });

  const lowStock = (products ?? []).filter((p) => p.stock_quantity <= LOW_STOCK_THRESHOLD);

  return (
    <div>
      <AdminHeader
        title="Products"
        subtitle="Herbal shop inventory, pricing, stock levels, and storefront visibility."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      {lowStock.length > 0 && (
        <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">Low stock alerts</h2>
          <ul className="mt-2 space-y-1 text-sm text-amber-900">
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} — <strong>{p.stock_quantity}</strong> units left
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Add new product</h2>
        <form action={upsertProductFromForm} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input name="name" required placeholder="Product name" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="price" type="number" min={0} step="0.01" required placeholder="Price (GHS)" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="stock_quantity" type="number" min={0} required placeholder="Stock quantity" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="image" placeholder="Image URL" className="rounded-lg border px-3 py-2 text-sm" />
          <textarea name="description" required rows={3} placeholder="Description" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked />
            Active on storefront
          </label>
          <button type="submit" className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white sm:col-span-2 sm:w-fit">
            Create product
          </button>
        </form>
      </section>

      <div className="space-y-4">
        {(products ?? []).map((p) => (
          <article key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-500">
                  GHS {Number(p.price).toFixed(0)} · {p.stock_quantity} in stock
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.is_active !== false ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {p.is_active !== false ? "Active" : "Hidden"}
                </span>
                {p.stock_quantity <= LOW_STOCK_THRESHOLD && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    Low stock
                  </span>
                )}
              </div>
            </div>

            <form action={upsertProductFromForm} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={p.id} />
              <input name="name" defaultValue={p.name} className="rounded-lg border px-3 py-2 text-sm" />
              <input name="price" type="number" defaultValue={p.price} className="rounded-lg border px-3 py-2 text-sm" />
              <input name="stock_quantity" type="number" defaultValue={p.stock_quantity} className="rounded-lg border px-3 py-2 text-sm" />
              <input name="image" defaultValue={p.image ?? ""} className="rounded-lg border px-3 py-2 text-sm" />
              <textarea name="description" defaultValue={p.description} rows={2} className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={p.is_active !== false} />
                Active
              </label>
              <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white sm:col-span-2 sm:w-fit">
                Save changes
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              <form action={setStockFromForm} className="flex items-center gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input
                  name="stock_quantity"
                  type="number"
                  min={0}
                  defaultValue={p.stock_quantity}
                  className="w-20 rounded border px-2 py-1 text-xs"
                />
                <button type="submit" className="rounded-lg border px-3 py-1.5 text-xs font-semibold">
                  Quick stock update
                </button>
              </form>
              <Link href="/shop" className="rounded-lg border px-3 py-1.5 text-xs font-semibold">
                View shop
              </Link>
              <form action={deleteProductFromForm}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">
                  Delete
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
