import { setAppointmentFromForm } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAppointmentsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("appointments")
    .select(
      "id, appointment_date, appointment_time, status, notes, users(name, email, phone), services(name)"
    )
    .order("appointment_date", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--text)]">Appointments</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Confirm, complete, or cancel requests.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[#fafafa] text-left text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {(rows ?? []).map((a) => {
              const u = a.users as { name?: string; email?: string; phone?: string } | null;
              const s = a.services as { name?: string } | null;
              return (
                <tr key={a.id} className="align-top">
                  <td className="px-4 py-3">
                    {a.appointment_date}
                    <br />
                    <span className="text-xs text-[var(--muted)]">{a.appointment_time}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u?.name}
                    <br />
                    <span className="text-xs text-[var(--muted)]">{u?.email}</span>
                    <br />
                    <span className="text-xs text-[var(--muted)]">{u?.phone}</span>
                  </td>
                  <td className="px-4 py-3">{s?.name}</td>
                  <td className="px-4 py-3 capitalize">{a.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={setAppointmentFromForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button
                          type="submit"
                          className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white"
                        >
                          Confirm
                        </button>
                      </form>
                      <form action={setAppointmentFromForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="cancelled" />
                        <button
                          type="submit"
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                        >
                          Cancel
                        </button>
                      </form>
                      <form action={setAppointmentFromForm}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value="completed" />
                        <button
                          type="submit"
                          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
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
