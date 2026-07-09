import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/admin-auth";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;

  const { session } = auth;
  return NextResponse.json({
    user: session.user,
    profile: session.profile,
  });
}
