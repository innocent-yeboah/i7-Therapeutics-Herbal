import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin/admin-auth";
import { logAdminAction } from "@/lib/admin/audit";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function PUT(_req: Request, ctx: Ctx) {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  const service = createServiceClient();
  const { data, error } = await service
    .from("consultation_requests")
    .update({
      status: "reviewed",
      reviewed_by: auth.session.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", ["pending", "reviewed"])
    .select("id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Consultation not found" }, { status: 404 });
  }

  await logAdminAction({
    adminId: auth.session.user.id,
    action: "consultation.review",
    targetType: "consultation_requests",
    targetId: id,
  });

  return NextResponse.json({ ok: true, consultation: data });
}
