import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/admin-auth";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;

  const data = await getAdminDashboardData(auth.session.supabase);
  return NextResponse.json(data);
}
