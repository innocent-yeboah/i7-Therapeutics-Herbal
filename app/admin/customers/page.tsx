import { createClient } from "@/lib/supabase/server";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("users")
    .select("id, name, email, phone, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-serif text-3xl text-[var(--text)]">Customer database</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Everyone who has created a profile.</p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[#fafafa] text-left text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {(rows ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">{c.name || "—"}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c.is_admin ? "Admin" : "Client"}</td>
                <td className="px-4 py-3 text-xs text-[var(--muted)]">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
