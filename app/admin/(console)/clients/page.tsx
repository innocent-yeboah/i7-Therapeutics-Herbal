import { AdminHeader } from "@/components/admin/admin-header";
import { ClientsTable } from "@/components/admin/clients-table";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const [{ data: users }, { data: appointments }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, phone, created_at")
      .eq("is_admin", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("appointments")
      .select("user_id, appointment_date, status")
      .neq("status", "cancelled"),
  ]);

  const apptStats = new Map<string, { count: number; lastVisit: string | null }>();
  (appointments ?? []).forEach((a) => {
    const uid = a.user_id as string;
    const prev = apptStats.get(uid) ?? { count: 0, lastVisit: null };
    prev.count += 1;
    const d = a.appointment_date as string;
    if (!prev.lastVisit || d > prev.lastVisit) prev.lastVisit = d;
    apptStats.set(uid, prev);
  });

  const clients = (users ?? []).map((u) => {
    const stats = apptStats.get(u.id) ?? { count: 0, lastVisit: null };
    return {
      id: u.id,
      name: u.name ?? "",
      email: u.email,
      phone: u.phone ?? "",
      appointmentCount: stats.count,
      lastVisit: stats.lastVisit,
      createdAt: u.created_at,
    };
  });

  return (
    <div>
      <AdminHeader
        title="Clients"
        subtitle="Registered customers, visit history, and profile management."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{clients.length}</span> registered
          clients · Use follow-up to send WhatsApp or email outreach.
        </p>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
