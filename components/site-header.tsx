import { HeaderNav } from "@/components/header-nav";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!data?.is_admin;
  }

  return <HeaderNav email={user?.email ?? null} isAdmin={isAdmin} />;
}
