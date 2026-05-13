import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Operations",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/account/login?next=/admin");
  }
  const { data: row } = await supabase
    .from("users")
    .select("is_admin, name")
    .eq("id", user.id)
    .single();
  if (!row?.is_admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#0b1220] lg:bg-[#f1f5f9]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar userEmail={user.email ?? ""} displayName={row.name?.trim() || ""} />
        <main className="min-w-0 flex-1 bg-[#f8fafc] lg:min-h-screen">
          <div className="mx-auto min-h-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
