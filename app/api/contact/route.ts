import { BRAND } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkContactRateLimit, getClientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_MESSAGE = 8000;

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = await checkContactRateLimit(ip, 5);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many messages from this network. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    let message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE) {
      message = message.slice(0, MAX_MESSAGE);
    }

    let admin: ReturnType<typeof createServiceClient>;
    try {
      admin = createServiceClient();
    } catch {
      console.error("Supabase service client unavailable for contact save");
      return NextResponse.json(
        { ok: false, error: "Server cannot save messages right now." },
        { status: 503 }
      );
    }

    const { data: inserted, error: insertErr } = await admin
      .from("contacts")
      .insert({
        name,
        email,
        message,
      })
      .select("id")
      .single();

    if (insertErr || !inserted?.id) {
      console.error("contacts insert", insertErr);
      return NextResponse.json(
        { ok: false, error: "Could not save your message. Please try again or email us directly." },
        { status: 500 }
      );
    }

    const contactId = inserted.id;
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        saved: true,
        emailed: false,
        contactId,
        warning:
          "Your message was saved. Email notifications are not configured on the server — our team will read it in the admin dashboard.",
      });
    }

    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: BRAND.email,
        replyTo: email,
        subject: `Website message from ${name}`,
        text: `${message}\n\n— ${name} <${email}>`,
      });

      await admin
        .from("contacts")
        .update({ status: "emailed", email_error: null })
        .eq("id", contactId);

      return NextResponse.json({ ok: true, saved: true, emailed: true, contactId });
    } catch (emailErr) {
      const emailErrorMsg =
        emailErr instanceof Error ? emailErr.message : "Resend send failed";

      await admin
        .from("contacts")
        .update({ status: "email_failed", email_error: emailErrorMsg.slice(0, 500) })
        .eq("id", contactId);

      console.error("Resend contact email failed", emailErr);

      return NextResponse.json({
        ok: true,
        saved: true,
        emailed: false,
        contactId,
        warning:
          "Your message was saved, but we could not send the notification email. Our team can still see it in the dashboard — please allow extra time for a reply.",
      });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
