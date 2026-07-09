import { HeaderNav } from "@/components/header-nav";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HeaderNav email={user?.email ?? null} />;
}
