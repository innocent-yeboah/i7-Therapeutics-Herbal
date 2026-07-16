import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkContactRateLimit, getClientIp } from "@/lib/rate-limit";
import { appSiteUrl, consultationCreateSchema } from "@/lib/consultation";
import {
  consultationRequestAdminEmail,
  consultationRequestClientEmail,
} from "@/lib/email/templates";
import {
  sendAdminNotificationEmail,
  sendCustomerNotificationEmail,
} from "@/lib/notifications/email";
import { BRAND } from "@/lib/constants";
import { normalizeWhatsAppNumber, whatsAppLink } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = await checkContactRateLimit(ip, 6);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests from this network. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = consultationCreateSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid form data";
      return NextResponse.json({ ok: false, error: first }, { status: 400 });
    }

    const data = parsed.data;
    let adminClient: ReturnType<typeof createServiceClient>;
    try {
      adminClient = createServiceClient();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Server cannot save consultations right now." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      user_id: user?.id ?? null,
      client_name: data.client_name.trim(),
      client_email: data.client_email.trim().toLowerCase(),
      client_phone: data.client_phone.trim(),
      preferred_contact: data.preferred_contact,
      preferred_date: data.preferred_date || null,
      preferred_time: data.preferred_time || null,
      condition_description: data.condition_description.trim(),
      symptoms: data.symptoms?.trim() || null,
      duration_of_condition: data.duration_of_condition?.trim() || null,
      previous_treatments: data.previous_treatments?.trim() || null,
      current_medications: data.current_medications?.trim() || null,
      allergies: data.allergies?.trim() || null,
      desired_outcome: data.desired_outcome?.trim() || null,
      additional_notes: data.additional_notes?.trim() || null,
      status: "pending" as const,
    };

    const { data: row, error } = await adminClient
      .from("consultation_requests")
      .insert(payload)
      .select("id")
      .single();

    if (error || !row) {
      console.error("consultation insert", error);
      return NextResponse.json(
        { ok: false, error: "Could not save your consultation. Please try again." },
        { status: 500 }
      );
    }

    const siteUrl = appSiteUrl();

    try {
      const clientMail = consultationRequestClientEmail({
        clientName: payload.client_name,
        preferredContact: payload.preferred_contact,
        siteUrl,
      });
      await sendCustomerNotificationEmail({
        to: payload.client_email,
        subject: clientMail.subject,
        html: clientMail.html,
        text: clientMail.text,
      });
    } catch (err) {
      console.warn("consultation client email failed", err);
    }

    try {
      const adminMail = consultationRequestAdminEmail({
        clientName: payload.client_name,
        clientEmail: payload.client_email,
        clientPhone: payload.client_phone,
        preferredContact: payload.preferred_contact,
        conditionDescription: payload.condition_description,
        consultationId: row.id,
        siteUrl,
      });
      await sendAdminNotificationEmail({
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
        replyTo: payload.client_email,
      });
    } catch (err) {
      console.warn("consultation admin email failed", err);
    }

    const waDigits = normalizeWhatsAppNumber(
      process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || BRAND.whatsappDigits
    );
    const waPreview =
      payload.preferred_contact === "whatsapp"
        ? whatsAppLink(
            waDigits,
            `Hello ${BRAND.name}, I just submitted a consultation request (${payload.client_name}).`
          )
        : null;

    return NextResponse.json({
      ok: true,
      id: row.id,
      whatsappPreview: waPreview,
    });
  } catch (err) {
    console.error("consultation POST", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
