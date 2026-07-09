import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/admin-auth";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.session;
  const { data, error } = await supabase.from("services").select("*").order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ services: data ?? [] });
}
