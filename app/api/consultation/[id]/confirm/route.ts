import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { appSiteUrl, bookingConfirmSchema } from "@/lib/consultation";
import { consultationBookingConfirmedEmail } from "@/lib/email/templates";
import {
  sendAdminNotificationEmail,
  sendCustomerNotificationEmail,
} from "@/lib/notifications/email";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const parsed = bookingConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const service = createServiceClient();
    const { data: row, error: fetchErr } = await service
      .from("consultation_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !row) {
      return NextResponse.json({ ok: false, error: "Consultation not found" }, { status: 404 });
    }

    if (row.status !== "recommendation_sent") {
      return NextResponse.json(
        { ok: false, error: "This consultation is not ready for booking confirmation." },
        { status: 400 }
      );
    }

    const emailFromBody = parsed.data.client_email?.trim().toLowerCase();
    const sessionEmail = (user?.email ?? "").toLowerCase();
    const ownsBySession =
      Boolean(user) &&
      (row.user_id === user!.id ||
        (typeof row.client_email === "string" && row.client_email.toLowerCase() === sessionEmail));
    const ownsByEmail =
      Boolean(emailFromBody) &&
      typeof row.client_email === "string" &&
      row.client_email.toLowerCase() === emailFromBody;

    if (!ownsBySession && !ownsByEmail) {
      return NextResponse.json(
        { ok: false, error: "Sign in with the email used for this consultation, or confirm your email." },
        { status: 403 }
      );
    }

    const therapies = (row.recommended_therapies as string[] | null) ?? [];
    const confirmedTherapy = therapies.join(", ") || "Recommended therapy session";
    const confirmedDuration = row.recommended_duration ?? "";
    const confirmedPrice = row.recommended_price;

    const { error: updateErr } = await service
      .from("consultation_requests")
      .update({
        status: "booking_confirmed",
        confirmed_therapy: confirmedTherapy,
        confirmed_duration: confirmedDuration,
        confirmed_price: confirmedPrice,
        confirmed_date: parsed.data.confirmed_date,
        confirmed_time: parsed.data.confirmed_time,
        booking_confirmed_at: new Date().toISOString(),
        user_id: row.user_id ?? user?.id ?? null,
      })
      .eq("id", id);

    if (updateErr) {
      console.error("confirm update", updateErr);
      return NextResponse.json({ ok: false, error: "Could not confirm booking." }, { status: 500 });
    }

    const siteUrl = appSiteUrl();
    const priceGhs =
      confirmedPrice != null ? Number(confirmedPrice).toFixed(0) : "TBD";

    try {
      const mail = consultationBookingConfirmedEmail({
        clientName: row.client_name,
        therapy: confirmedTherapy,
        duration: confirmedDuration || "As recommended",
        priceGhs,
        date: parsed.data.confirmed_date,
        time: parsed.data.confirmed_time,
        siteUrl,
      });
      await sendCustomerNotificationEmail({
        to: row.client_email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      await sendAdminNotificationEmail({
        subject: `Booking confirmed — ${row.client_name}`,
        html: mail.html,
        text: mail.text,
      });
    } catch (err) {
      console.warn("booking confirm email failed", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("confirm PUT", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
