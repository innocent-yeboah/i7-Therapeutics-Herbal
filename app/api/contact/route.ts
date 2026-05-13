import { getResendFromAddress } from "@/lib/email/from";
import { BRAND } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkContactRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  contactAdminNotificationEmail,
  contactCustomerConfirmationEmail,
} from "@/lib/email/templates";
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

    let adminClient: ReturnType<typeof createServiceClient>;
    try {
      adminClient = createServiceClient();
    } catch {
      console.error("Supabase service client unavailable for contact save");
      return NextResponse.json(
        { ok: false, error: "Server cannot save messages right now." },
        { status: 503 }
      );
    }

    const { data: inserted, error: insertErr } = await adminClient
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
    const from = getResendFromAddress();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;

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
      const adminMail = contactAdminNotificationEmail({ name, email, message, siteUrl });

      await resend.emails.send({
        from,
        to: BRAND.email,
        replyTo: email,
        subject: adminMail.subject,
        html: adminMail.html,
        text: adminMail.text,
      });

      let customerMailError: string | null = null;
      try {
        const customerMail = contactCustomerConfirmationEmail({ name, siteUrl });
        await resend.emails.send({
          from,
          to: email,
          replyTo: BRAND.email,
          subject: customerMail.subject,
          html: customerMail.html,
          text: customerMail.text,
        });
      } catch (custErr) {
        customerMailError =
          custErr instanceof Error ? custErr.message : "Customer confirmation send failed";
        console.error("Resend customer confirmation failed", custErr);
      }

      await adminClient
        .from("contacts")
        .update({
          status: "emailed",
          email_error: customerMailError ? customerMailError.slice(0, 500) : null,
        })
        .eq("id", contactId);

      return NextResponse.json({
        ok: true,
        saved: true,
        emailed: true,
        customerEmailed: !customerMailError,
        contactId,
        ...(customerMailError
          ? {
              warning:
                "We received your message. A confirmation email could not be delivered to your inbox, but we will still reply to the address you provided.",
            }
          : {}),
      });
    } catch (emailErr) {
      const emailErrorMsg =
        emailErr instanceof Error ? emailErr.message : "Resend send failed";

      await adminClient
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
          "Your message was saved, but we could not notify our team by email. Our staff can still see it in the dashboard — please allow extra time for a reply.",
      });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
