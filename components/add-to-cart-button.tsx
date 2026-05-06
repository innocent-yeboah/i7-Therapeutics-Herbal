"use client";

import { useCart } from "@/lib/cart/cart-context";
import type { ProductRow } from "@/lib/types/database";

export function AddToCartButton({ product }: { product: ProductRow }) {
  const { addProduct } = useCart();
  return (
    <button
      type="button"
      onClick={() => addProduct(product, 1)}
      disabled={product.stock_quantity < 1}
      className="mt-4 w-full rounded-full bg-[var(--primary)] py-2.5 text-sm font-semibold text-white transition hover:bg-[#256628] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {product.stock_quantity < 1 ? "Out of stock" : "Add to cart"}
    </button>
  );
}
