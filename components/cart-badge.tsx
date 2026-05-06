"use client";

import { useCart } from "@/lib/cart/cart-context";
import Link from "next/link";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function CartBadge() {
  const { itemCount } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={itemCount > 0 ? `Shopping cart, ${itemCount} items` : "Shopping cart"}
      className="relative inline-flex items-center justify-center rounded-full border border-[var(--border)] p-2 text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
    >
      <CartIcon className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-semibold text-white">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
