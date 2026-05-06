"use server";

import { fulfillOrderFromPaystack } from "@/lib/orders/fulfill";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { paystackInitialize } from "@/lib/paystack";

export async function createPendingOrder(
  items: { product_id: string; quantity: number }[]
) {
  const user = await requireUser();
  if (!user.email) {
    return { ok: false as const, error: "Your account needs an email for checkout." };
  }

  const supabase = await createClient();

  const ids = Array.from(new Set(items.map((i) => i.product_id)));
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, price, stock_quantity")
    .in("id", ids);

  if (pErr || !products?.length) {
    return { ok: false as const, error: "Could not load products." };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  for (const line of items) {
    const p = productMap.get(line.product_id);
    if (!p || line.quantity < 1) {
      return { ok: false as const, error: "Invalid cart line." };
    }
    if (p.stock_quantity < line.quantity) {
      return { ok: false as const, error: "Not enough stock for one or more items." };
    }
    total += Number(p.price) * line.quantity;
  }

  const reference = `i7_${randomBytes(12).toString("hex")}`;

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: total,
      status: "pending",
      paystack_reference: reference,
    })
    .select("id, total_amount, paystack_reference")
    .single();

  if (oErr || !order) {
    return { ok: false as const, error: oErr?.message ?? "Order failed." };
  }

  const rows = items.map((line) => {
    const p = productMap.get(line.product_id)!;
    return {
      order_id: order.id,
      product_id: line.product_id,
      quantity: line.quantity,
      price: Number(p.price),
    };
  });

  const { error: oiErr } = await supabase.from("order_items").insert(rows);
  if (oiErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false as const, error: oiErr.message };
  }

  revalidatePath("/account");
  return {
    ok: true as const,
    orderId: order.id,
    reference: order.paystack_reference as string,
    totalAmount: Number(order.total_amount),
    email: user.email,
  };
}

export async function startPaystackCheckout(orderId: string, reference: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id, total_amount, status, paystack_reference")
    .eq("id", orderId)
    .single();

  if (error || !order || order.user_id !== user.id) {
    return { ok: false as const, error: "Invalid order." };
  }

  if (order.status !== "pending" || order.paystack_reference !== reference) {
    return { ok: false as const, error: "Invalid order state." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (!user.email) {
    return { ok: false as const, error: "Missing email." };
  }

  const amountPesewas = Math.round(Number(order.total_amount) * 100);

  try {
    const data = await paystackInitialize({
      email: user.email,
      amountPesewas,
      reference,
      callbackUrl: `${appUrl}/checkout/complete`,
      metadata: { order_id: order.id, user_id: user.id },
    });

    return { ok: true as const, authorizationUrl: data.authorization_url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Payment init failed";
    return { ok: false as const, error: msg };
  }
}

export async function finalizePaidOrder(reference: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("user_id, paystack_reference")
    .eq("paystack_reference", reference)
    .single();

  if (!order || order.user_id !== user.id) {
    return { ok: false as const, error: "Order not found." };
  }

  return fulfillOrderFromPaystack(reference);
}
