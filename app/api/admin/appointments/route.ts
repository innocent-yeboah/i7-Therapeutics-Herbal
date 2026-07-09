import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin/admin-auth";

export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.session;
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, status, notes, users(name, email, phone), services(name)"
    )
    .order("appointment_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ appointments: data ?? [] });
}
