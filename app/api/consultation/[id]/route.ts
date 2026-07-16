import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin/admin-auth";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await verifyAdmin();
  const isStaff = admin.ok;

  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("consultation_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    if (isStaff) {
      return NextResponse.json({ ok: true, consultation: data });
    }

    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const email = (user.email ?? "").toLowerCase();
    const owns =
      data.user_id === user.id ||
      (typeof data.client_email === "string" && data.client_email.toLowerCase() === email);

    if (!owns) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true, consultation: data });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
