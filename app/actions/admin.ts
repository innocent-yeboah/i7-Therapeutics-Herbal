"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { BRAND } from "@/lib/constants";
import { Resend } from "resend";
import { whatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { fulfillOrderFromPaystack } from "@/lib/orders/fulfill";

export async function setAppointmentStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/account");
  return { ok: true as const };
}

export async function setOrderStatus(
  id: string,
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/account");
  return { ok: true as const };
}

export async function setProductStock(id: string, stock_quantity: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ stock_quantity }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/shop");
  return { ok: true as const };
}

export async function sendClientFollowUp(input: {
  target_user_id: string;
  channel: "whatsapp" | "email";
  message: string;
}) {
  const { user, supabase } = await requireAdmin();

  const { data: target, error } = await supabase
    .from("users")
    .select("id, email, name, phone")
    .eq("id", input.target_user_id)
    .single();

  if (error || !target) {
    return { ok: false as const, error: "Client not found." };
  }

  await supabase.from("admin_followups").insert({
    admin_id: user.id,
    target_user_id: target.id,
    channel: input.channel,
    message: input.message,
  });

  const waDigits = normalizeWhatsAppNumber(target.phone || "");
  const wa =
    input.channel === "whatsapp" && waDigits.length >= 10
      ? whatsAppLink(waDigits, input.message)
      : null;

  if (input.channel === "email" && target.email) {
    const key = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    if (key) {
      const resend = new Resend(key);
      await resend.emails.send({
        from,
        to: target.email,
        subject: `Message from ${BRAND.name}`,
        text: input.message,
      });
    }
  }

  revalidatePath("/admin");
  return { ok: true as const, whatsappUrl: wa };
}

export async function setAppointmentFromForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed";
  if (!id || !status) return;
  await setAppointmentStatus(id, status);
}

export async function setOrderFromForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  if (!id || !status) return;
  await setOrderStatus(id, status);
}

export async function setStockFromForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const quantity = Number(formData.get("quantity"));
  if (!id || Number.isNaN(quantity)) return;
  await setProductStock(id, quantity);
}

/** Re-run fulfillment for a logged Paystack charge (e.g. after webhook failure). */
export async function retryPaystackWebhookFailure(id: string) {
  const { supabase } = await requireAdmin();
  const { data: row, error } = await supabase
    .from("webhook_failures")
    .select("id, reference, resolved_at")
    .eq("id", id)
    .single();

  if (error || !row?.reference) {
    return { ok: false as const, error: "Webhook record not found." };
  }
  if (row.resolved_at) {
    return { ok: false as const, error: "Already resolved." };
  }

  const result = await fulfillOrderFromPaystack(row.reference);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }

  await supabase
    .from("webhook_failures")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/webhook-failures");
  revalidatePath("/admin/orders");
  return { ok: true as const };
}
