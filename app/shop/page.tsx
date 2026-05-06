import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/add-to-cart-button";

export const metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl text-[var(--text)]">Herbal products</h1>
        <p className="mt-3 text-[var(--muted)]">
          Oils, teas, and daily botanical support — crafted with gentle, purposeful ingredients.
        </p>
      </header>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {(products ?? []).map((p) => (
          <article
            key={p.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative aspect-square">
              <Image
                src={
                  p.image ||
                  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"
                }
                alt={p.name}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-serif text-xl text-[var(--text)]">{p.name}</h2>
              <p className="mt-2 flex-1 text-sm text-[var(--muted)]">{p.description}</p>
              <p className="mt-4 text-lg font-semibold text-[var(--secondary)]">
                GHS {Number(p.price).toFixed(0)}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {p.stock_quantity} in stock
              </p>
              <AddToCartButton product={p} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
