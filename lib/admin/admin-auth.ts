import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export type AdminSession = {
  user: { id: string; email?: string };
  profile: { is_admin: boolean; name: string; email: string };
  supabase: Awaited<ReturnType<typeof createClient>>;
};

export type AdminAuthResult =
  | { ok: true; session: AdminSession }
  | { ok: false; response: NextResponse };

/**
 * Verifies the current request has an authenticated admin session (cookie-based).
 * Use in App Router API route handlers — not for page layouts (use requireAdmin there).
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin, name, email")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    session: {
      user: { id: user.id, email: user.email },
      profile: {
        is_admin: profile.is_admin,
        name: profile.name ?? "",
        email: profile.email ?? user.email ?? "",
      },
      supabase,
    },
  };
}
