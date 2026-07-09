import { updateContactStatusFromForm } from "@/app/actions/admin-crud";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContactsPage() {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("contacts")
    .select("id, created_at, name, email, message, status, email_error")
    .order("created_at", { ascending: false })
    .limit(150);

  const pending = (rows ?? []).filter((r) => r.status === "pending" || r.status === "email_failed").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-[var(--text)]">Contact messages</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Inbound form submissions. Messages are saved even when email to staff fails — check rows marked{" "}
          <strong>email failed</strong>.
        </p>
        <p className="mt-2 text-sm font-semibold text-amber-900">
          {pending > 0 ? `${pending} need attention (pending or email failed).` : "Inbox is clear."}
        </p>
      </header>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Could not load contacts (run the production SQL migration if this table is missing).
        </p>
      )}

      {!error && (rows?.length ?? 0) === 0 && (
        <p className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted)]">
          No messages yet.
        </p>
      )}

      <div className="space-y-4">
        {(rows ?? []).map((row) => (
          <article
            key={row.id}
            className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-[var(--text)]">{row.name}</p>
              <span className="font-mono text-xs text-[var(--muted)]">
                {new Date(row.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--secondary)]">{row.email}</p>
            <p
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                row.status === "emailed"
                  ? "bg-emerald-50 text-emerald-800"
                  : row.status === "email_failed"
                    ? "bg-red-50 text-red-800"
                    : "bg-amber-50 text-amber-900"
              }`}
            >
              {row.status === "pending" && "Pending (email not configured or not sent yet)"}
              {row.status === "emailed" && "Staff notified by email"}
              {row.status === "email_failed" && "Saved — email to staff failed"}
            </p>
            {row.email_error && (
              <p className="mt-2 text-xs text-red-700">Email error: {row.email_error}</p>
            )}
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">{row.message}</p>
            <form action={updateContactStatusFromForm} className="mt-4">
              <input type="hidden" name="id" value={row.id} />
              <input type="hidden" name="status" value="emailed" />
              <button type="submit" className="rounded-lg border px-3 py-1 text-xs font-semibold">
                Mark handled
              </button>
            </form>
          </article>
        ))}
      </div>

      <Link href="/admin" className="inline-block text-sm font-semibold text-[var(--primary)]">
        ← Overview
      </Link>
    </div>
  );
}
