import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PersonalizedProfileCard } from "@/components/account/personalized-profile-card";

export const metadata = {
  title: "My profile",
};

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login?next=/admin/profile");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, phone, is_admin, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200/90 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700/90">
          Personal
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-900">
          Admin profile
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Your display identity in the operations workspace. Changes save to your account and sync when you
          visit{" "}
          <Link href="/account" className="font-semibold text-[#1e3a5f] hover:underline">
            My account
          </Link>{" "}
          on the storefront.
        </p>
      </header>

      <PersonalizedProfileCard
        variant="admin"
        email={user.email}
        name={profile?.name ?? ""}
        phone={profile?.phone ?? ""}
        isAdmin
        createdAt={profile?.created_at ?? user.created_at ?? new Date().toISOString()}
      />
    </div>
  );
}
