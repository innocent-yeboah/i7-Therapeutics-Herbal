import { getResendFromAddress } from "@/lib/email/from";
import { BRAND } from "@/lib/constants";
import { Resend } from "resend";

/**
 * Inbound “ops” alerts (new orders, bookings). Comma-separated in env; defaults to BRAND.email.
 */
export function getAdminNotificationRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS?.trim();
  if (raw) {
    return [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))];
  }
  return [BRAND.email];
}

export async function sendAdminNotificationEmail(params: {
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = getResendFromAddress();
  if (!key) {
    console.warn("[notifications] RESEND_API_KEY missing; skipping admin email:", params.subject);
    return;
  }

  const to = getAdminNotificationRecipients();
  if (!to.length) return;

  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

export async function sendCustomerNotificationEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = getResendFromAddress();
  if (!key) {
    console.warn("[notifications] RESEND_API_KEY missing; skipping customer email:", params.subject);
    return;
  }

  const resend = new Resend(key);
  await resend.emails.send({
    from,
    to: params.to,
    replyTo: params.replyTo ?? BRAND.email,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}
