import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin/admin-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim().toLowerCase();

  const service = createServiceClient();
  let query = service
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin consultations list", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  let rows = data ?? [];
  if (q) {
    rows = rows.filter(
      (r) =>
        r.client_name?.toLowerCase().includes(q) ||
        r.client_email?.toLowerCase().includes(q) ||
        r.client_phone?.includes(q) ||
        r.condition_description?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ ok: true, consultations: rows });
}
