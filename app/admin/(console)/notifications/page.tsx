import { sendBulkNotificationFromForm } from "@/app/actions/admin-crud";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { BRAND } from "@/lib/constants";

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const { data: logs } = await supabase
    .from("notification_log")
    .select("id, channel, audience, subject, message, recipient_count, created_at, admin_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const { count: clientCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", false);

  return (
    <div>
      <AdminHeader
        title="Notifications"
        subtitle="Send bulk email campaigns or log WhatsApp outreach to clients."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-slate-900">Send notification</h2>
        <p className="mt-1 text-sm text-slate-500">
          Email delivery requires Resend (`RESEND_API_KEY`). WhatsApp bulk is logged for manual
          follow-up via the Follow-up page.
        </p>
        <form action={sendBulkNotificationFromForm} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Channel</label>
              <select name="channel" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp (log only)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Audience</label>
              <select name="audience" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="all">All clients ({clientCount ?? 0})</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Subject (email only)</label>
            <input
              name="subject"
              placeholder={`Message from ${BRAND.name}`}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Write your message to clients…"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white">
            Send notification
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Sent notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Channel</th>
                <th className="px-6 py-3">Recipients</th>
                <th className="px-6 py-3">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(logs ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No notifications sent yet.
                  </td>
                </tr>
              ) : (
                (logs ?? []).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-xs text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 capitalize">{log.channel}</td>
                      <td className="px-6 py-3 font-mono">{log.recipient_count}</td>
                      <td className="max-w-xs truncate px-6 py-3 text-slate-600">
                        {log.subject ? `${log.subject}: ` : ""}
                        {log.message}
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
