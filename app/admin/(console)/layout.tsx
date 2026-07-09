import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Operations",
};

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login?next=/admin");
  }
  const { data: row } = await supabase
    .from("users")
    .select("is_admin, name")
    .eq("id", user.id)
    .single();
  if (!row?.is_admin) {
    redirect("/admin/login?error=not_admin");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminSidebar userEmail={user.email ?? ""} displayName={row.name?.trim() || ""} />
      <div className="lg:pl-64">
        <main className="min-w-0">
          <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
