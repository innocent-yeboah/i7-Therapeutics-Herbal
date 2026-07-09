import { saveSiteSettingsFromForm, setAdminRoleFromForm } from "@/app/actions/admin-crud";
import { AdminHeader } from "@/components/admin/admin-header";
import { BRAND } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const [{ data: settings }, { data: users }, { data: auditLog }] = await Promise.all([
    supabase.from("site_settings").select("*"),
    supabase.from("users").select("id, name, email, is_admin, created_at").order("created_at"),
    supabase
      .from("admin_audit_log")
      .select("id, action, target_type, target_id, created_at, admin_id")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const booking = (settings?.find((s) => s.key === "booking")?.value as Record<string, number>) ?? {};
  const notifications =
    (settings?.find((s) => s.key === "notifications")?.value as Record<string, boolean>) ?? {};

  return (
    <div>
      <AdminHeader
        title="Settings"
        subtitle="Business configuration, admin access, and security audit trail."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-slate-900">General</h2>
          <p className="mt-1 text-sm text-slate-500">Brand defaults are in code; override contact display here.</p>
          <form action={saveSiteSettingsFromForm} className="mt-4 space-y-3">
            <input type="hidden" name="key" value="general" />
            <input
              name="businessName"
              defaultValue={BRAND.name}
              placeholder="Business name"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <input
              name="contactEmail"
              defaultValue={BRAND.email}
              placeholder="Contact email"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <input
              name="phoneDisplay"
              defaultValue={BRAND.phoneDisplay}
              placeholder="Phone display"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">
              Save general settings
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Booking</h2>
          <form action={saveSiteSettingsFromForm} className="mt-4 grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="key" value="booking" />
            <div>
              <label className="text-xs font-semibold text-slate-600">Slot (min)</label>
              <input
                name="slotMinutes"
                type="number"
                defaultValue={booking.slotMinutes ?? 30}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Start hour</label>
              <input
                name="dayStartHour"
                type="number"
                defaultValue={booking.dayStartHour ?? 9}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">End hour</label>
              <input
                name="dayEndHour"
                type="number"
                defaultValue={booking.dayEndHour ?? 17}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white sm:col-span-3 sm:w-fit">
              Save booking settings
            </button>
          </form>
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Notification preferences</h2>
        <form action={saveSiteSettingsFromForm} className="mt-4 flex flex-wrap gap-6">
          <input type="hidden" name="key" value="notifications" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="appointmentEmails"
              defaultChecked={notifications.appointmentEmails !== false}
            />
            Appointment status emails
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="orderEmails"
              defaultChecked={notifications.orderEmails !== false}
            />
            Order status emails
          </label>
          <button type="submit" className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">
            Save
          </button>
        </form>
      </section>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Admin users</h2>
        <p className="mt-1 text-sm text-slate-500">Grant or revoke admin access. You cannot change your own role here.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(users ?? []).map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name || "—"}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.is_admin ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.is_admin ? "Admin" : "Client"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.id !== user!.id ? (
                      <form action={setAdminRoleFromForm}>
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="is_admin" value={u.is_admin ? "false" : "true"} />
                        <button
                          type="submit"
                          className="rounded-lg border px-3 py-1 text-xs font-semibold"
                        >
                          {u.is_admin ? "Revoke admin" : "Make admin"}
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">Current user</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Audit log</h2>
          <p className="text-sm text-slate-500">Recent administrative actions for security review.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">When</th>
                <th className="px-6 py-3">Admin</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(auditLog ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No audit entries yet.
                  </td>
                </tr>
              ) : (
                (auditLog ?? []).map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-3 text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">
                        {entry.admin_id ? `${entry.admin_id.slice(0, 8)}…` : "—"}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{entry.action}</td>
                      <td className="px-6 py-3 text-xs text-slate-600">
                        {entry.target_type}
                        {entry.target_id ? ` · ${entry.target_id.slice(0, 8)}…` : ""}
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
