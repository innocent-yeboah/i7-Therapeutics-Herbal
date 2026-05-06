import { createServiceClient } from "@/lib/supabase/admin";
import { paystackVerify } from "@/lib/paystack";
import { revalidatePath } from "next/cache";

export async function fulfillOrderFromPaystack(reference: string) {
  const admin = createServiceClient();
  const tx = await paystackVerify(reference);

  if (tx.status !== "success") {
    return { ok: false as const, error: "Payment not successful." };
  }

  const { data: order, error: oErr } = await admin
    .from("orders")
    .select("id, total_amount, status, user_id, paystack_reference")
    .eq("paystack_reference", reference)
    .single();

  if (oErr || !order) {
    return { ok: false as const, error: "Order not found." };
  }

  const metaOrderId =
    tx.metadata &&
    typeof tx.metadata === "object" &&
    "order_id" in tx.metadata
      ? String((tx.metadata as { order_id?: string }).order_id)
      : null;

  if (metaOrderId && metaOrderId !== order.id) {
    return { ok: false as const, error: "Metadata mismatch." };
  }

  const expectedPesewas = Math.round(Number(order.total_amount) * 100);
  if (Number(tx.amount) !== expectedPesewas) {
    return { ok: false as const, error: "Amount mismatch." };
  }

  if (order.status === "paid" || order.status === "processing" || order.status === "shipped") {
    return { ok: true as const, orderId: order.id };
  }

  const { data: items, error: iErr } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", order.id);

  if (iErr || !items?.length) {
    return { ok: false as const, error: "Order items missing." };
  }

  for (const line of items) {
    const { data: prod, error: pErr } = await admin
      .from("products")
      .select("stock_quantity")
      .eq("id", line.product_id)
      .single();

    if (pErr || prod === null) {
      return { ok: false as const, error: "Stock read failed." };
    }

    const next = prod.stock_quantity - line.quantity;
    if (next < 0) {
      return { ok: false as const, error: "Insufficient stock at fulfillment." };
    }

    const { error: uErr } = await admin
      .from("products")
      .update({ stock_quantity: next })
      .eq("id", line.product_id);

    if (uErr) {
      return { ok: false as const, error: "Stock update failed." };
    }
  }

  const { error: ouErr } = await admin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id);

  if (ouErr) {
    return { ok: false as const, error: "Order update failed." };
  }

  revalidatePath("/account");
  revalidatePath("/admin");
  return { ok: true as const, orderId: order.id };
}
