import { BRAND } from "@/lib/constants";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    if (apiKey) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from,
        to: BRAND.email,
        replyTo: body.email,
        subject: `Website message from ${body.name}`,
        text: `${body.message}\n\n— ${body.name} <${body.email}>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
