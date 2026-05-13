"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  appointmentBookedAdminNotificationEmail,
  appointmentBookedCustomerConfirmationEmail,
} from "@/lib/email/templates";
import { sendAdminNotificationEmail, sendCustomerNotificationEmail } from "@/lib/notifications/email";

export async function getBookedSlotsForDate(date: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map((r) => r.appointment_time);
}

export async function createAppointment(input: {
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("appointments").insert({
    user_id: user.id,
    service_id: input.service_id,
    appointment_date: input.appointment_date,
    appointment_time: input.appointment_time,
    notes: input.notes ?? "",
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, error: "That time slot was just booked. Please pick another." };
    }
    return { ok: false as const, error: error.message };
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;
  try {
    const [{ data: svc }, { data: profile }] = await Promise.all([
      supabase.from("services").select("name").eq("id", input.service_id).single(),
      supabase.from("users").select("email, name, phone").eq("id", user.id).single(),
    ]);
    const serviceName = svc?.name ?? "Service";
    const custEmail =
      (profile?.email?.trim() || user.email || "").trim();
    const custName =
      (profile?.name?.trim() || user.user_metadata?.full_name || custEmail.split("@")[0] || "Client").trim();
    const firstName = custName.split(/\s+/)[0] || custName;
    const custPhone = (profile?.phone ?? "").trim();

    const adminMail = appointmentBookedAdminNotificationEmail({
      serviceName,
      appointmentDate: input.appointment_date,
      appointmentTime: input.appointment_time,
      customerName: custName,
      customerEmail: custEmail || "—",
      customerPhone: custPhone,
      notes: input.notes ?? "",
      siteUrl,
    });
    await sendAdminNotificationEmail({
      subject: adminMail.subject,
      html: adminMail.html,
      text: adminMail.text,
      replyTo: custEmail || undefined,
    });

    if (custEmail) {
      const custMail = appointmentBookedCustomerConfirmationEmail({
        firstName,
        serviceName,
        appointmentDate: input.appointment_date,
        appointmentTime: input.appointment_time,
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
    console.error("[notifications] appointment emails failed", e);
  }

  revalidatePath("/account");
  revalidatePath("/book");
  revalidatePath("/admin");
  return { ok: true as const };
}
