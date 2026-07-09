"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { BRAND } from "@/lib/constants";
import { Resend } from "resend";
import { whatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { fulfillOrderFromPaystack } from "@/lib/orders/fulfill";
import {
  clientFollowUpEmail,
  appointmentStatusUpdateCustomerEmail,
  orderStatusUpdateCustomerEmail,
} from "@/lib/email/templates";
import { getResendFromAddress } from "@/lib/email/from";
import { sendCustomerNotificationEmail } from "@/lib/notifications/email";

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function appointmentStatusMessage(status: string): string {
  switch (status) {
    case "confirmed":
      return "Great news — your session is confirmed. We look forward to seeing you. If you need to reschedule, reply to this email.";
    case "cancelled":
      return "Your appointment has been cancelled. If you did not request this or have questions, please contact us right away.";
    case "completed":
      return "Thank you for visiting. We have marked your session as completed. We hope to see you again soon.";
    case "pending":
      return "Your booking is awaiting confirmation. Our team will update you shortly.";
    default:
      return `Your appointment status has been updated to ${formatStatusLabel(status)}.`;
  }
}

function orderStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Your order is pending payment or final confirmation.";
    case "paid":
      return "Your payment has been recorded. We are getting your order ready.";
    case "processing":
      return "We are preparing your items for packaging and dispatch.";
    case "shipped":
      return "Your order has been shipped or passed to the courier. Watch for it soon.";
    case "delivered":
      return "Your order has been marked as delivered. Thank you for shopping with us.";
    case "cancelled":
      return "This order has been cancelled. If you have questions, contact us.";
    default:
      return `Your order status is now: ${formatStatusLabel(status)}.`;
  }
}

export async function setAppointmentStatus(
  id: string,
  status: "pending" | "confirmed" | "cancelled" | "completed"
) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: before, error: fetchErr } = await supabase
    .from("appointments")
    .select("status, appointment_date, appointment_time, services(name), users(name, email)")
    .eq("id", id)
    .single();

  if (fetchErr || !before) {
    return { ok: false as const, error: fetchErr?.message ?? "Appointment not found." };
  }
  if (before.status === status) {
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
    revalidatePath("/account");
    return { ok: true as const };
  }

  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  revalidatePath("/account");

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;
  const u = before.users as { name?: string; email?: string } | null;
  const svc = before.services as { name?: string } | null;
  const custEmail = u?.email?.trim();
  if (custEmail) {
    try {
      const first = (u?.name ?? "").split(/\s+/)[0] || "there";
      const mail = appointmentStatusUpdateCustomerEmail({
        firstName: first,
        serviceName: svc?.name ?? "Your session",
        appointmentDate: String(before.appointment_date),
        appointmentTime: String(before.appointment_time),
        statusLabel: formatStatusLabel(status),
        bodyMessage: appointmentStatusMessage(status),
        siteUrl,
      });
      await sendCustomerNotificationEmail({
        to: custEmail,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    } catch (e) {
      console.error("[notify] appointment status email failed", e);
    }
  }

  return { ok: true as const };
}

export async function setOrderStatus(
  id: string,
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"
) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: before, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, total_amount, users(name, email)")
    .eq("id", id)
    .single();

  if (fetchErr || !before) {
    return { ok: false as const, error: fetchErr?.message ?? "Order not found." };
  }
  if (before.status === status) {
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/account");
    return { ok: true as const };
  }

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;
  const u = before.users as { name?: string; email?: string } | null;
  const custEmail = u?.email?.trim();
  if (custEmail) {
    try {
      const first = (u?.name ?? "").split(/\s+/)[0] || "there";
      const totalGhs = Number(before.total_amount).toFixed(2);
      const mail = orderStatusUpdateCustomerEmail({
        firstName: first,
        orderId: before.id,
        totalGhs,
        statusLabel: formatStatusLabel(status),
        bodyMessage: orderStatusMessage(status),
        siteUrl,
      });
      await sendCustomerNotificationEmail({
        to: custEmail,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    } catch (e) {
      console.error("[notify] order status email failed", e);
    }
  }

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
    const from = getResendFromAddress();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;
    if (key) {
      const resend = new Resend(key);
      const styled = clientFollowUpEmail({ message: input.message, siteUrl });
      await resend.emails.send({
        from,
        to: target.email,
        subject: styled.subject,
        html: styled.html,
        text: styled.text,
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
  const quantity = Number(formData.get("stock_quantity") ?? formData.get("quantity"));
  if (!id || Number.isNaN(quantity)) return;
  await setProductStock(id, quantity);
  revalidatePath("/admin/products");
}

export async function updateCustomerProfileFromForm(formData: FormData): Promise<void> {
  await requireAdmin();
  const userId = String(formData.get("user_id") || "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!userId) return;
  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ name, phone }).eq("id", userId);
  if (error) {
    console.error("updateCustomerProfile", error);
    return;
  }
  revalidatePath("/admin/customers");
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
  revalidatePath("/account");
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
