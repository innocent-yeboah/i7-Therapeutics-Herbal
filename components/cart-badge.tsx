"use client";

import { useCart } from "@/lib/cart/cart-context";
import Link from "next/link";

export function CartBadge() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      className="relative rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      Cart
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-semibold text-white">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
