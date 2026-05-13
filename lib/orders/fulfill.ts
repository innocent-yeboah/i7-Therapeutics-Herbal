import { createServiceClient } from "@/lib/supabase/admin";
import { paystackVerify } from "@/lib/paystack";
import { revalidatePath } from "next/cache";
import {
  orderPaidAdminNotificationEmail,
  orderPaidCustomerConfirmationEmail,
} from "@/lib/email/templates";
import { sendAdminNotificationEmail, sendCustomerNotificationEmail } from "@/lib/notifications/email";

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

  const skipDuplicateEmail = payload?.already_fulfilled === true;
  if (!skipDuplicateEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;
    try {
      const [{ data: customer }, { data: lineRows }] = await Promise.all([
        admin.from("users").select("email, name").eq("id", order.user_id).single(),
        admin
          .from("order_items")
          .select("quantity, price, products(name)")
          .eq("order_id", order.id),
      ]);

      const custEmail = customer?.email?.trim() || "";
      const custName = customer?.name?.trim() || "Customer";
      const firstName = custName.split(/\s+/)[0] || custName;
      const lines = (lineRows ?? []).map((row) => {
        const p = row.products as { name?: string } | null;
        const name = p?.name ?? "Product";
        const qty = row.quantity;
        const lineTotal = (Number(row.price) * qty).toFixed(2);
        return { name, quantity: qty, lineTotal };
      });
      const totalGhs = Number(order.total_amount).toFixed(2);
      const ref = order.paystack_reference ?? reference;

      const adminMail = orderPaidAdminNotificationEmail({
        orderId: order.id,
        totalGhs,
        reference: ref,
        customerName: custName,
        customerEmail: custEmail || "—",
        lines,
        siteUrl,
      });
      await sendAdminNotificationEmail({
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: custEmail || undefined,
      });

      if (custEmail) {
        const custMail = orderPaidCustomerConfirmationEmail({
          firstName,
          orderId: order.id,
          totalGhs,
          lines,
          siteUrl,
        });
        await sendCustomerNotificationEmail({
          to: custEmail,
          subject: custMail.subject,
          html: custMail.html,
          text: custMail.text,
        });
      }
    } catch (e) {
      console.error("[notifications] order paid emails failed", e);
    }
  }

  revalidatePath("/account");
  revalidatePath("/admin");
  return { ok: true as const, orderId: order.id };
}
