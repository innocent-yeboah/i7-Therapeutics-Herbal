import { StatusBadge } from "@/components/consultation/StatusBadge";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { ConsultationRequestRow, ConsultationStatus } from "@/lib/types/database";
import { consultationStatusLabels } from "@/lib/consultation";
import Link from "next/link";

export const metadata = { title: "Consultations" };

const filters: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "recommendation_sent", label: "Recommendation sent" },
  { key: "booking_confirmed", label: "Booking confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default async function AdminConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q = "" } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  let query = supabase
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data } = await query;
  let rows = (data as ConsultationRequestRow[]) ?? [];

  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.client_name.toLowerCase().includes(needle) ||
        r.client_email.toLowerCase().includes(needle) ||
        r.client_phone.includes(needle) ||
        r.condition_description.toLowerCase().includes(needle)
    );
  }

  const counts = await Promise.all(
    (["pending", "reviewed", "recommendation_sent", "booking_confirmed"] as ConsultationStatus[]).map(
      async (s) => {
        const { count } = await supabase
          .from("consultation_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", s);
        return [s, count ?? 0] as const;
      }
    )
  );
  const countMap = Object.fromEntries(counts);

  return (
    <div>
      <AdminHeader
        title="Consultations"
        subtitle="Review client conditions and send personalized therapy recommendations."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {(
          [
            ["pending", "Pending review"],
            ["reviewed", "Reviewed"],
            ["recommendation_sent", "Awaiting confirmation"],
            ["booking_confirmed", "Bookings confirmed"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{countMap[key] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={
              f.key === "all"
                ? `/admin/consultations${q ? `?q=${encodeURIComponent(q)}` : ""}`
                : `/admin/consultations?status=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`
            }
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === f.key
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <form className="mt-4" action="/admin/consultations" method="get">
        {status !== "all" && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, email, phone, condition…"
          className="w-full max-w-md rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Condition</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No consultations found.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{c.client_name}</p>
                    <p className="text-xs text-slate-500">{c.client_email}</p>
                    <p className="text-xs text-slate-500">{c.client_phone}</p>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">
                    <p className="line-clamp-2">{c.condition_description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                    <p className="mt-1 text-[10px] text-slate-400">
                      {consultationStatusLabels[c.status]}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(c.created_at).toLocaleDateString("en-GB", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/consultations/${c.id}/review`}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
