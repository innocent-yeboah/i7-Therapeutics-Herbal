"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export default function CartPage() {
  const { lines, subtotal, setQuantity, removeLine } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-[var(--muted)]">Browse the shop to add herbal favourites.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
        >
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl text-[var(--text)]">Cart</h1>
      <div className="mt-8 space-y-6">
        {lines.map((line) => (
          <div
            key={line.product.id}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-36">
              <Image
                src={
                  line.product.image ||
                  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80"
                }
                alt={line.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-medium">{line.product.name}</h2>
              <p className="text-sm text-[var(--muted)]">
                GHS {Number(line.product.price).toFixed(0)} each
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="text-xs text-[var(--muted)]">
                  Qty{" "}
                  <input
                    type="number"
                    min={1}
                    max={line.product.stock_quantity}
                    value={line.quantity}
                    onChange={(e) =>
                      setQuantity(line.product.id, Number(e.target.value) || 1)
                    }
                    className="ml-2 w-20 rounded-lg border border-[var(--border)] px-2 py-1 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeLine(line.product.id)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-right text-sm font-semibold text-[var(--secondary)]">
              GHS {(Number(line.product.price) * line.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col items-end gap-4 border-t border-[var(--border)] pt-6">
        <p className="text-lg">
          Subtotal:{" "}
          <span className="font-serif text-2xl font-semibold text-[var(--secondary)]">
            GHS {subtotal.toFixed(2)}
          </span>
        </p>
        <Link
          href="/checkout"
          className="rounded-full bg-[var(--primary)] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#256628]"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
