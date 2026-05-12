import { createServiceClient } from "@/lib/supabase/admin";
import { paystackVerify } from "@/lib/paystack";
import { revalidatePath } from "next/cache";

type FulfillRpcResult = {
  ok?: boolean;
  already_fulfilled?: boolean;
  error?: string;
};

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

  const { data: rpcRaw, error: rpcErr } = await admin.rpc("fulfill_order_atomic", {
    p_order_id: order.id,
  });

  if (rpcErr) {
    return {
      ok: false as const,
      error: rpcErr.message || "Fulfillment transaction failed.",
    };
  }

  const payload = rpcRaw as FulfillRpcResult | null;
  if (payload && payload.ok === false) {
    return {
      ok: false as const,
      error: payload.error ?? "Fulfillment rejected.",
    };
  }

  revalidatePath("/account");
  revalidatePath("/admin");
  return { ok: true as const, orderId: order.id };
}
