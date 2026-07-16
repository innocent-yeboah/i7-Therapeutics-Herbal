import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin/admin-auth";
import { logAdminAction } from "@/lib/admin/audit";

type Ctx = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  let feedback: string | null = null;
  let rating: number | null = null;
  try {
    const body = await req.json();
    if (typeof body?.feedback === "string") feedback = body.feedback.trim() || null;
    if (typeof body?.rating === "number") rating = body.rating;
  } catch {
    // optional body
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("consultation_requests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      feedback,
      rating,
    })
    .eq("id", id)
    .in("status", ["booking_confirmed", "completed"])
    .select("id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "Consultation not found or not confirmable" }, { status: 404 });
  }

  await logAdminAction({
    adminId: auth.session.user.id,
    action: "consultation.complete",
    targetType: "consultation_requests",
    targetId: id,
  });

  return NextResponse.json({ ok: true, consultation: data });
}
