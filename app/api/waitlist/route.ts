import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { checkContactRateLimit, getClientIp } from "@/lib/rate-limit";
import { COMING_SOON_OFFERINGS } from "@/lib/services";

export const runtime = "nodejs";

const VALID_SLUGS = new Set(COMING_SOON_OFFERINGS.map((o) => o.slug));

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { allowed } = await checkContactRateLimit(ip, 8);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-ups from this network. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as {
      email?: string;
      offeringSlug?: string;
      offeringName?: string;
    };

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const offeringSlug = typeof body.offeringSlug === "string" ? body.offeringSlug.trim() : "";
    const offeringName =
      typeof body.offeringName === "string" ? body.offeringName.trim() : offeringSlug;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
    }

    if (!offeringSlug || !VALID_SLUGS.has(offeringSlug)) {
      return NextResponse.json({ ok: false, error: "Invalid offering" }, { status: 400 });
    }

    let adminClient: ReturnType<typeof createServiceClient>;
    try {
      adminClient = createServiceClient();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Server cannot save sign-ups right now." },
        { status: 503 }
      );
    }

    const { error: insertErr } = await adminClient.from("waitlist_subscribers").upsert(
      {
        email,
        offering_slug: offeringSlug,
        offering_name: offeringName,
      },
      { onConflict: "email,offering_slug", ignoreDuplicates: true }
    );

    if (insertErr) {
      console.error("waitlist insert", insertErr);
      return NextResponse.json(
        { ok: false, error: "Could not save your sign-up. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `You're on the waitlist for ${offeringName}. We'll be in touch when it launches.`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
