import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin/admin-auth";
import { logAdminAction } from "@/lib/admin/audit";
import { appSiteUrl, recommendationSchema } from "@/lib/consultation";
import { consultationRecommendationEmail } from "@/lib/email/templates";
import { sendCustomerNotificationEmail } from "@/lib/notifications/email";
import { BRAND } from "@/lib/constants";
import { normalizeWhatsAppNumber, whatsAppLink } from "@/lib/whatsapp";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(req: Request, ctx: Ctx) {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  try {
    const body = await req.json();
    const parsed = recommendationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid recommendation" },
        { status: 400 }
      );
    }

    const service = createServiceClient();
    const { data: row, error: fetchErr } = await service
      .from("consultation_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    if (["cancelled", "completed"].includes(row.status)) {
      return NextResponse.json(
        { ok: false, error: "Cannot send recommendation for this status." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await service
      .from("consultation_requests")
      .update({
        recommended_therapies: parsed.data.recommended_therapies,
        recommended_duration: parsed.data.recommended_duration,
        recommended_price: parsed.data.recommended_price,
        recommendation_notes: parsed.data.recommendation_notes?.trim() || null,
        recommendation_sent_at: now,
        status: "recommendation_sent",
        reviewed_by: row.reviewed_by ?? auth.session.user.id,
        reviewed_at: row.reviewed_at ?? now,
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
    }

    const siteUrl = appSiteUrl();
    const confirmUrl = `${siteUrl}/dashboard/consultation/${id}`;
    const priceGhs = Number(parsed.data.recommended_price).toFixed(0);

    try {
      const mail = consultationRecommendationEmail({
        clientName: row.client_name,
        therapies: parsed.data.recommended_therapies,
        duration: parsed.data.recommended_duration,
        priceGhs,
        notes: parsed.data.recommendation_notes,
        confirmUrl,
        siteUrl,
      });
      await sendCustomerNotificationEmail({
        to: row.client_email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
    } catch (err) {
      console.warn("recommendation email failed", err);
    }

    const waDigits = normalizeWhatsAppNumber(row.client_phone);
    const waLink =
      row.preferred_contact === "whatsapp" && waDigits.length >= 9
        ? whatsAppLink(
            waDigits.startsWith("0")
              ? `233${waDigits.slice(1)}`
              : waDigits,
            `Hello ${row.client_name}, ${BRAND.name} has prepared your personalized therapy recommendation. Please check your email for details and to confirm your booking.`
          )
        : null;

    await logAdminAction({
      adminId: auth.session.user.id,
      action: "consultation.recommendation_sent",
      targetType: "consultation_requests",
      targetId: id,
      details: {
        therapies: parsed.data.recommended_therapies,
        price: parsed.data.recommended_price,
      },
    });

    return NextResponse.json({ ok: true, whatsappLink: waLink });
  } catch (err) {
    console.error("recommendation POST", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
