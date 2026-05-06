import { FollowUpForm } from "@/components/admin-follow-up-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminFollowUpPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, name, email, phone")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  return <FollowUpForm clients={data ?? []} />;
}
