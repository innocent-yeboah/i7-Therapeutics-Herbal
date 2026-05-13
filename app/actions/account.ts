"use server";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Update the signed-in user's display name and phone (RLS: own row). */
export async function updateMyProfileFromForm(formData: FormData): Promise<void> {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ name, phone }).eq("id", user.id);

  if (error) {
    console.error("updateMyProfile", error);
    return;
  }

  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/admin/profile");
}
