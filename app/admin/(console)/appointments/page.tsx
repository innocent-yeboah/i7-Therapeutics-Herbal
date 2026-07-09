import { setAppointmentFromForm } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/admin-header";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminAppointmentsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const { data: rows } = await supabase
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, status, notes, users(name, email, phone), services(name)"
    )
    .order("appointment_date", { ascending: false });

  const csvRows = (rows ?? []).map((a) => {
    const u = a.users as { name?: string; email?: string; phone?: string } | null;
    const s = a.services as { name?: string } | null;
    return {
      date: a.appointment_date,
      time: a.appointment_time,
      client: u?.name ?? "",
      email: u?.email ?? "",
      phone: u?.phone ?? "",
      service: s?.name ?? "",
      status: a.status,
      notes: a.notes ?? "",
    };
  });

  return (
    <div>
      <AdminHeader
        title="Appointments"
        subtitle="Confirm, complete, or cancel booking requests. Export for reporting."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{rows?.length ?? 0}</span> total
          appointments
        </p>
        <ExportCsvButton
          filename={`appointments-${new Date().toISOString().slice(0, 10)}.csv`}
          rows={csvRows}
          columns={[
            { key: "date", header: "Date" },
            { key: "time", header: "Time" },
            { key: "client", header: "Client" },
            { key: "email", header: "Email" },
            { key: "phone", header: "Phone" },
            { key: "service", header: "Service" },
            { key: "status", header: "Status" },
            { key: "notes", header: "Notes" },
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(rows ?? []).map((a) => {
              const u = a.users as { name?: string; email?: string; phone?: string } | null;
              const s = a.services as { name?: string } | null;
              return (
                <tr key={a.id} className="align-top hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    {a.appointment_date}
                    <br />
                    <span className="text-xs text-slate-500">{a.appointment_time}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u?.name}
                    <br />
                    <span className="text-xs text-slate-500">{u?.email}</span>
                    {u?.phone ? (
                      <>
                        <br />
                        <span className="text-xs text-slate-500">{u.phone}</span>
                      </>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{s?.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize">
                      {a.status}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-slate-600">{a.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={setAppointmentFromForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Confirm
                        </button>
                      </form>
                      <form action={setAppointmentFromForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="cancelled" />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                        >
                          Cancel
                        </button>
                      </form>
                      <form action={setAppointmentFromForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="completed" />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold"
                        >
                          Complete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
