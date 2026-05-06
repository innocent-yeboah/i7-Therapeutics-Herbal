"use client";

import { createPendingOrder, startPaystackCheckout } from "@/app/actions/checkout";
import { useCart } from "@/lib/cart/cart-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CheckoutClient({ email }: { email: string }) {
  const { lines, subtotal } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const pay = () => {
    setError(null);
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }
    startTransition(async () => {
      const orderRes = await createPendingOrder(
        lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity }))
      );
      if (!orderRes.ok) {
        setError(orderRes.error);
        return;
      }
      const payRes = await startPaystackCheckout(orderRes.orderId, orderRes.reference);
      if (!payRes.ok) {
        setError(payRes.error);
        return;
      }
      window.location.href = payRes.authorizationUrl;
    });
  };

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl">Nothing to checkout</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Add products from the shop first.</p>
        <Link href="/shop" className="mt-6 inline-block text-[var(--primary)] font-semibold">
          Continue shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl text-[var(--text)]">Checkout</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Paying as <span className="font-medium text-[var(--text)]">{email}</span>. You will be
        redirected to Paystack to complete payment in Ghana cedis (GHS).
      </p>
      <ul className="mt-8 space-y-3 rounded-2xl border border-[var(--border)] bg-white p-6">
        {lines.map((l) => (
          <li key={l.product.id} className="flex justify-between text-sm">
            <span>
              {l.product.name} × {l.quantity}
            </span>
            <span className="font-medium text-[var(--secondary)]">
              GHS {(Number(l.product.price) * l.quantity).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span className="font-serif text-2xl text-[var(--secondary)]">
          GHS {subtotal.toFixed(2)}
        </span>
      </div>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="mt-8 w-full rounded-full bg-[var(--primary)] py-3 text-sm font-semibold text-white hover:bg-[#256628] disabled:opacity-60"
      >
        {pending ? "Preparing secure payment…" : "Pay with Paystack"}
      </button>
      <button
        type="button"
        onClick={() => router.back()}
        className="mt-4 w-full rounded-full border border-[var(--border)] py-2.5 text-sm text-[var(--muted)] hover:border-[var(--primary)]"
      >
        Back to cart
      </button>
    </div>
  );
}
