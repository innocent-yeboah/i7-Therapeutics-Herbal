"use client";

import { useCart } from "@/lib/cart/cart-context";
import { useEffect } from "react";

export function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
