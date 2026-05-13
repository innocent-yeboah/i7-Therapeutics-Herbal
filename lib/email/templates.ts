import { BRAND, COLORS } from "@/lib/constants";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMultiline(s: string): string {
  return escapeHtml(s).replace(/\r\n/g, "\n").replace(/\n/g, "<br />");
}

function brandShell(params: {
  title: string;
  preheader: string;
  innerHtml: string;
  siteUrl?: string;
}) {
  const { primary, secondary, text, border, background } = COLORS;
  const pre = escapeHtml(params.preheader);
  const siteForFooter = params.siteUrl?.trim() || BRAND.websiteUrl;
  const footerSite =
    siteForFooter && siteForFooter.startsWith("http")
      ? `<a href="${escapeHtml(siteForFooter)}" style="color:${primary};text-decoration:none;font-weight:600;">Visit website</a>`
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Georgia,'Times New Roman',serif;">
<span style="display:none;font-size:1px;color:#f4f6f8;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${pre}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background-color:${background};border-radius:12px;overflow:hidden;border:1px solid ${border};box-shadow:0 2px 8px rgba(30,58,95,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg, ${secondary} 0%, #152a45 100%);padding:28px 24px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.02em;color:#ffffff;line-height:1.25;">${escapeHtml(BRAND.name)}</p>
            <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.88);font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${escapeHtml(BRAND.tagline)}</p>
          </td>
        </tr>
        <tr>
          <td style="height:4px;background:${primary};font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:28px 24px 8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${text};font-size:15px;line-height:1.55;">
            ${params.innerHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:8px 24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid ${border};font-size:12px;color:#6b7280;line-height:1.6;">
              ${escapeHtml(BRAND.location)}<br />
              <a href="mailto:${escapeHtml(BRAND.email)}" style="color:${primary};text-decoration:none;">${escapeHtml(BRAND.email)}</a>
              &nbsp;·&nbsp; <a href="tel:${escapeHtml(BRAND.phoneTel)}" style="color:${primary};text-decoration:none;">${escapeHtml(BRAND.phoneDisplay)}</a>
              ${footerSite ? `<br /><br />${footerSite}` : ""}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`.trim();
}

export function contactAdminNotificationEmail(input: {
  name: string;
  email: string;
  message: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `New website message from ${input.name}`;
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">New contact form message</p>
            <p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(input.name)}</p>
            <p style="margin:0 0 20px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(input.email)}" style="color:${COLORS.primary};text-decoration:none;">${escapeHtml(input.email)}</a></p>
            <div style="background:#f0f7f1;border-left:4px solid ${COLORS.primary};padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 20px;">
              <p style="margin:0;font-size:14px;color:${COLORS.text};">${formatMultiline(input.message)}</p>
            </div>
            <p style="margin:0;">
              <a href="mailto:${escapeHtml(input.email)}?subject=${encodeURIComponent("Re: Your message to " + BRAND.name)}" style="display:inline-block;background:${COLORS.primary};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;">Reply to ${escapeHtml(input.name)}</a>
            </p>
  `.trim();

  const text = [
    `New message via ${BRAND.name} website`,
    "",
    `From: ${input.name} <${input.email}>`,
    "",
    input.message,
    "",
    `Reply: mailto:${input.email}`,
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: `${input.name} sent a message on the website.`,
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

export function contactCustomerConfirmationEmail(input: {
  name: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const first = input.name.split(/\s+/)[0] || input.name;
  const subject = `We received your message — ${BRAND.name}`;
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Thank you, ${escapeHtml(first)}</p>
            <p style="margin:0 0 16px;">Your message landed safely with our team. We read every inquiry and will get back to you as soon as we can — usually within one to two business days.</p>
            <p style="margin:0 0 16px;">If your question is urgent, you can also reach us on WhatsApp or by phone using the details below.</p>
            <div style="background:#f4f7fb;border-radius:10px;padding:16px 18px;margin:20px 0 0;">
              <p style="margin:0 0 8px;font-size:13px;color:${COLORS.secondary};font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Visit us</p>
              <p style="margin:0;font-size:14px;color:${COLORS.text};">${escapeHtml(BRAND.location)}</p>
            </div>
  `.trim();

  const text = [
    `Hi ${first},`,
    "",
    `Thank you for contacting ${BRAND.name}. We have received your message and will reply soon.`,
    "",
    BRAND.location,
    `${BRAND.email} | ${BRAND.phoneDisplay}`,
    "",
    BRAND.tagline,
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: "We'll get back to you shortly.",
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

/** Styled message for admin-initiated client follow-up (dashboard). */
export function clientFollowUpEmail(input: {
  message: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `A message from ${BRAND.name}`;
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Hello from ${escapeHtml(
              BRAND.name
            )}</p>
            <div style="background:#f4f7fb;border-left:4px solid ${COLORS.primary};padding:14px 16px;border-radius:0 8px 8px 0;margin:0;">
              <p style="margin:0;font-size:15px;color:${COLORS.text};">${formatMultiline(input.message)}</p>
            </div>
            <p style="margin:20px 0 0;font-size:14px;color:#6b7280;">With care,<br />${escapeHtml(BRAND.name)}</p>
  `.trim();

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: "A note from our wellness team.",
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text: input.message,
  };
}

export function orderPaidAdminNotificationEmail(input: {
  orderId: string;
  totalGhs: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  lines: { name: string; quantity: number; lineTotal: string }[];
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `New paid order — ${BRAND.name} (${input.totalGhs} GHS)`;
  const rows = input.lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};">${escapeHtml(l.name)}</td><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};text-align:center;">${l.quantity}</td><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};text-align:right;font-variant-numeric:tabular-nums;">${escapeHtml(l.lineTotal)}</td></tr>`
    )
    .join("");
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Payment received</p>
            <p style="margin:0 0 12px;">A customer completed checkout. Fulfill in <strong>Admin → Orders</strong>.</p>
            <table role="presentation" width="100%" style="border-collapse:collapse;margin:16px 0;font-size:14px;">
              <tr><td style="padding:4px 0;color:${COLORS.text};"><strong>Order ID</strong></td><td style="padding:4px 0;font-family:ui-monospace,monospace;">${escapeHtml(input.orderId)}</td></tr>
              <tr><td style="padding:4px 0;"><strong>Paystack ref</strong></td><td style="padding:4px 0;font-family:ui-monospace,monospace;">${escapeHtml(input.reference)}</td></tr>
              <tr><td style="padding:4px 0;"><strong>Total</strong></td><td style="padding:4px 0;">${escapeHtml(input.totalGhs)} GHS</td></tr>
              <tr><td style="padding:4px 0;"><strong>Customer</strong></td><td style="padding:4px 0;">${escapeHtml(input.customerName)} · <a href="mailto:${escapeHtml(input.customerEmail)}" style="color:${COLORS.primary};text-decoration:none;">${escapeHtml(input.customerEmail)}</a></td></tr>
            </table>
            <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:8px;font-size:14px;">
              <thead><tr><th align="left" style="padding:8px 0;border-bottom:2px solid ${COLORS.secondary};color:${COLORS.secondary};">Item</th><th style="padding:8px 0;border-bottom:2px solid ${COLORS.secondary};text-align:center;">Qty</th><th align="right" style="padding:8px 0;border-bottom:2px solid ${COLORS.secondary};">Line</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
  `.trim();

  const text = [
    `Paid order ${input.orderId}`,
    `Total: ${input.totalGhs} GHS`,
    `Paystack: ${input.reference}`,
    `Customer: ${input.customerName} <${input.customerEmail}>`,
    "",
    ...input.lines.map((l) => `- ${l.name} x${l.quantity} = ${l.lineTotal} GHS`),
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: `New order ${input.totalGhs} GHS from ${input.customerName}.`,
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

export function orderPaidCustomerConfirmationEmail(input: {
  firstName: string;
  orderId: string;
  totalGhs: string;
  lines: { name: string; quantity: number; lineTotal: string }[];
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Order confirmed — ${BRAND.name}`;
  const rows = input.lines
    .map(
      (l) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};">${escapeHtml(l.name)}</td><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};text-align:center;">${l.quantity}</td><td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};text-align:right;">${escapeHtml(l.lineTotal)}</td></tr>`
    )
    .join("");
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Thank you, ${escapeHtml(input.firstName)}</p>
            <p style="margin:0 0 12px;">We have received your payment and your order is confirmed.</p>
            <p style="margin:0 0 8px;font-family:ui-monospace,monospace;font-size:13px;color:#6b7280;">Order ID: ${escapeHtml(input.orderId)}</p>
            <p style="margin:0 0 16px;"><strong>Total paid:</strong> ${escapeHtml(input.totalGhs)} GHS</p>
            <table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px;">
              <thead><tr><th align="left" style="padding:8px 0;border-bottom:2px solid ${COLORS.secondary};">Item</th><th style="padding:8px 0;border-bottom:2px solid ${COLORS.secondary};text-align:center;">Qty</th><th align="right" style="padding:8px 0;border-bottom:2px solid ${COLORS.secondary};">Line</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
            <p style="margin:20px 0 0;">You can view status anytime under <strong>Account → Orders</strong> on our website.</p>
  `.trim();

  const text = [
    `Hi ${input.firstName},`,
    "",
    `Your order ${input.orderId} is confirmed. Total: ${input.totalGhs} GHS.`,
    "",
    ...input.lines.map((l) => `- ${l.name} x${l.quantity} = ${l.lineTotal} GHS`),
    "",
    `— ${BRAND.name}`,
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: "Your payment was successful.",
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

export function appointmentBookedAdminNotificationEmail(input: {
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `New booking — ${input.serviceName} on ${input.appointmentDate}`;
  const notesBlock =
    input.notes.trim().length > 0
      ? `<div style="background:#f4f7fb;border-radius:8px;padding:12px 14px;margin-top:12px;"><p style="margin:0 0 6px;font-size:12px;font-weight:600;color:${COLORS.secondary};text-transform:uppercase;">Notes</p><p style="margin:0;font-size:14px;">${formatMultiline(input.notes)}</p></div>`
      : "";
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">New appointment request</p>
            <table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0;font-size:14px;">
              <tr><td style="padding:6px 0;"><strong>Service</strong></td><td style="padding:6px 0;">${escapeHtml(input.serviceName)}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Date</strong></td><td style="padding:6px 0;">${escapeHtml(input.appointmentDate)}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Time</strong></td><td style="padding:6px 0;">${escapeHtml(input.appointmentTime)}</td></tr>
              <tr><td style="padding:6px 0;vertical-align:top;"><strong>Client</strong></td><td style="padding:6px 0;">${escapeHtml(input.customerName)}<br /><a href="mailto:${escapeHtml(input.customerEmail)}" style="color:${COLORS.primary};text-decoration:none;">${escapeHtml(input.customerEmail)}</a><br />${escapeHtml(input.customerPhone || "—")}</td></tr>
            </table>
            ${notesBlock}
            <p style="margin:20px 0 0;font-size:14px;">Confirm or adjust in <strong>Admin → Appointments</strong>.</p>
  `.trim();

  const text = [
    "New appointment",
    `${input.serviceName} — ${input.appointmentDate} ${input.appointmentTime}`,
    `${input.customerName} <${input.customerEmail}> ${input.customerPhone}`,
    input.notes ? `Notes: ${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: `${input.customerName} booked ${input.serviceName}.`,
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

export function appointmentBookedCustomerConfirmationEmail(input: {
  firstName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Booking received — ${input.serviceName}`;
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Thank you, ${escapeHtml(input.firstName)}</p>
            <p style="margin:0 0 12px;">We have received your booking request for <strong>${escapeHtml(input.serviceName)}</strong>.</p>
            <div style="background:#f0f7f1;border-left:4px solid ${COLORS.primary};padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="margin:0;font-size:15px;"><strong>Date:</strong> ${escapeHtml(input.appointmentDate)}</p>
              <p style="margin:8px 0 0;font-size:15px;"><strong>Time:</strong> ${escapeHtml(input.appointmentTime)}</p>
            </div>
            <p style="margin:0;">Our team will confirm your appointment shortly. If you need to reschedule, reply to this email or call us.</p>
  `.trim();

  const text = [
    `Hi ${input.firstName},`,
    "",
    `Your booking for ${input.serviceName} on ${input.appointmentDate} at ${input.appointmentTime} has been received.`,
    "We will confirm your appointment soon.",
    "",
    `— ${BRAND.name}`,
    BRAND.phoneDisplay,
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: "We'll confirm your appointment soon.",
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

/** Customer alert after admin updates appointment status. */
export function appointmentStatusUpdateCustomerEmail(input: {
  firstName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  statusLabel: string;
  bodyMessage: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Appointment ${input.statusLabel} — ${BRAND.name}`;
  const accountHint =
    input.siteUrl && input.siteUrl.startsWith("http")
      ? `<p style="margin:20px 0 0;font-size:14px;">View details anytime in your <a href="${escapeHtml(input.siteUrl)}/account" style="color:${COLORS.primary};font-weight:600;">account</a>.</p>`
      : "";
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Hello, ${escapeHtml(input.firstName)}</p>
            <p style="margin:0 0 12px;">${escapeHtml(input.bodyMessage)}</p>
            <div style="background:#f0f7f1;border-left:4px solid ${COLORS.primary};padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="margin:0;font-size:14px;"><strong>Service:</strong> ${escapeHtml(input.serviceName)}</p>
              <p style="margin:8px 0 0;font-size:14px;"><strong>Schedule:</strong> ${escapeHtml(input.appointmentDate)} at ${escapeHtml(input.appointmentTime)}</p>
              <p style="margin:8px 0 0;font-size:14px;"><strong>Status:</strong> ${escapeHtml(input.statusLabel)}</p>
            </div>
            <p style="margin:0;font-size:14px;color:#6b7280;">Questions? Reply to this email or call ${escapeHtml(BRAND.phoneDisplay)}.</p>
            ${accountHint}
  `.trim();

  const text = [
    `Hi ${input.firstName},`,
    "",
    input.bodyMessage,
    "",
    `${input.serviceName} — ${input.appointmentDate} ${input.appointmentTime}`,
    `Status: ${input.statusLabel}`,
    "",
    `— ${BRAND.name}`,
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: `Your booking is now ${input.statusLabel}.`,
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}

/** Customer alert after admin updates order status. */
export function orderStatusUpdateCustomerEmail(input: {
  firstName: string;
  orderId: string;
  totalGhs: string;
  statusLabel: string;
  bodyMessage: string;
  siteUrl?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Order update — ${input.statusLabel} — ${BRAND.name}`;
  const accountHint =
    input.siteUrl && input.siteUrl.startsWith("http")
      ? `<p style="margin:20px 0 0;font-size:14px;">See full history under <a href="${escapeHtml(input.siteUrl)}/account" style="color:${COLORS.primary};font-weight:600;">Account → Orders</a>.</p>`
      : "";
  const inner = `
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:${COLORS.secondary};font-family:Georgia,'Times New Roman',serif;">Hello, ${escapeHtml(input.firstName)}</p>
            <p style="margin:0 0 12px;">${escapeHtml(input.bodyMessage)}</p>
            <div style="background:#f4f7fb;border-left:4px solid ${COLORS.secondary};padding:14px 16px;border-radius:0 8px 8px 0;margin:16px 0;">
              <p style="margin:0;font-family:ui-monospace,monospace;font-size:13px;color:#6b7280;">Order ${escapeHtml(input.orderId)}</p>
              <p style="margin:8px 0 0;font-size:14px;"><strong>Total:</strong> ${escapeHtml(input.totalGhs)} GHS</p>
              <p style="margin:8px 0 0;font-size:14px;"><strong>Status:</strong> ${escapeHtml(input.statusLabel)}</p>
            </div>
            ${accountHint}
  `.trim();

  const text = [
    `Hi ${input.firstName},`,
    "",
    input.bodyMessage,
    "",
    `Order ${input.orderId} · ${input.totalGhs} GHS · ${input.statusLabel}`,
    "",
    `— ${BRAND.name}`,
  ].join("\n");

  return {
    subject,
    html: brandShell({
      title: subject,
      preheader: `Your order is now ${input.statusLabel}.`,
      innerHtml: inner,
      siteUrl: input.siteUrl,
    }),
    text,
  };
}
