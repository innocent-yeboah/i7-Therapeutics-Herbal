"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getBookedSlotsForDate(date: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("appointment_date", date)
    .neq("status", "cancelled");

  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []).map((r) => r.appointment_time);
}

export async function createAppointment(input: {
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("appointments").insert({
    user_id: user.id,
    service_id: input.service_id,
    appointment_date: input.appointment_date,
    appointment_time: input.appointment_time,
    notes: input.notes ?? "",
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false as const, error: "That time slot was just booked. Please pick another." };
    }
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/book");
  revalidatePath("/admin");
  return { ok: true as const };
}
