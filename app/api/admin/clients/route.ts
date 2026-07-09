import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/admin-auth";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.session;
  const [{ data: users }, { data: appointments }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, phone, created_at")
      .eq("is_admin", false)
      .order("created_at", { ascending: false }),
    supabase.from("appointments").select("user_id, appointment_date, status").neq("status", "cancelled"),
  ]);

  const stats = new Map<string, { count: number; lastVisit: string | null }>();
  (appointments ?? []).forEach((a) => {
    const uid = a.user_id as string;
    const prev = stats.get(uid) ?? { count: 0, lastVisit: null };
    prev.count += 1;
    const d = a.appointment_date as string;
    if (!prev.lastVisit || d > prev.lastVisit) prev.lastVisit = d;
    stats.set(uid, prev);
  });

  const clients = (users ?? []).map((u) => ({
    ...u,
    appointmentCount: stats.get(u.id)?.count ?? 0,
    lastVisit: stats.get(u.id)?.lastVisit ?? null,
  }));

  return NextResponse.json({ clients });
}
