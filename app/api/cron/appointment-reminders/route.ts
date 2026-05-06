import { createServiceClient } from "@/lib/supabase/admin";
import { whatsAppLink, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { BRAND } from "@/lib/constants";
import { toZonedTime, format } from "date-fns-tz";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
const TZ = "Africa/Accra";

async function sendTwilioWhatsApp(toDigits: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) return { ok: false as const, reason: "twilio_not_configured" };

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:+${toDigits.replace(/^\+/, "")}`,
    Body: body,
  });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    console.error("Twilio WhatsApp error", t);
    return { ok: false as const, reason: "twilio_error" };
  }
  return { ok: true as const };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const now = new Date();
  const accraNow = toZonedTime(now, TZ);
  const tomorrow = addDays(accraNow, 1);
  const dateStr = format(tomorrow, "yyyy-MM-dd", { timeZone: TZ });

  const { data: appts, error } = await admin
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, notes, users!appointments_user_id_fkey(name, phone), services!appointments_service_id_fkey(name)"
    )
    .eq("appointment_date", dateStr)
    .in("status", ["pending", "confirmed"])
    .is("reminder_sent_at", null);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  let sent = 0;
  for (const row of appts ?? []) {
    const u = row.users as { name?: string; phone?: string } | null;
    const s = row.services as { name?: string } | null;
    const phoneRaw = u?.phone || "";
    const digits = normalizeWhatsAppNumber(phoneRaw);
    const msg = [
      `Hi ${u?.name || "there"},`,
      `Reminder: your ${s?.name ?? "session"} at ${BRAND.name} is tomorrow (${dateStr}) at ${row.appointment_time}.`,
      `Studio: ${BRAND.location}.`,
      `Reply here if you need to reschedule.`,
    ].join(" ");

    const twilioConfigured =
      !!process.env.TWILIO_ACCOUNT_SID &&
      !!process.env.TWILIO_AUTH_TOKEN &&
      !!process.env.TWILIO_WHATSAPP_FROM;

    let shouldMarkSent = false;

    if (digits.length < 10) {
      shouldMarkSent = true;
      console.info("Reminder skipped — no valid phone for appointment", row.id);
    } else if (!twilioConfigured) {
      shouldMarkSent = true;
      console.info("Reminder wa.me (configure Twilio for auto-send):", whatsAppLink(digits, msg));
    } else {
      const twilio = await sendTwilioWhatsApp(digits, msg);
      if (twilio.ok) {
        shouldMarkSent = true;
        sent++;
      } else {
        console.error("Reminder not marked sent — Twilio error for appointment", row.id);
      }
    }

    if (shouldMarkSent) {
      await admin
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", row.id);
    }
  }

  return NextResponse.json({
    ok: true,
    date: dateStr,
    processed: appts?.length ?? 0,
    twilioDelivered: sent,
  });
}
