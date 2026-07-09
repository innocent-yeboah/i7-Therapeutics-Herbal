import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RetryWebhookButton } from "./retry-button";

export default async function AdminWebhookFailuresPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("webhook_failures")
    .select("id, created_at, event_type, reference, error_message, resolved_at, payload")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[var(--text)]">Paystack webhooks</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Failed fulfillment after a successful charge. Paystack will retry when we return an error; you can also
          retry manually once the issue is fixed.
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load webhook failures (run the production SQL migration if this table is missing).
        </p>
      )}

      {!error && (rows?.length ?? 0) === 0 && (
        <p className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          No failed webhooks on record.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[#fafafa] text-xs uppercase text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Error</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--muted)]">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.reference ?? "—"}</td>
                <td className="max-w-[280px] px-4 py-3 text-xs text-red-700">
                  {row.error_message ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {row.resolved_at ? (
                    <span className="text-emerald-700">Resolved</span>
                  ) : (
                    <span className="font-semibold text-amber-800">Open</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!row.resolved_at && row.reference ? <RetryWebhookButton id={row.id} /> : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/admin" className="inline-block text-sm font-semibold text-[var(--primary)]">
        ← Overview
      </Link>
    </div>
  );
}
