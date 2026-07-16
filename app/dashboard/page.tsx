import { StatusBadge } from "@/components/consultation/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { ConsultationRequestRow } from "@/lib/types/database";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My consultations",
};

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login?next=/dashboard");
  }

  let consultations: ConsultationRequestRow[] = [];
  try {
    const service = createServiceClient();
    const email = (user.email ?? "").toLowerCase();
    const { data } = await service
      .from("consultation_requests")
      .select("*")
      .or(`user_id.eq.${user.id},client_email.eq.${email}`)
      .order("created_at", { ascending: false });
    consultations = (data as ConsultationRequestRow[]) ?? [];
  } catch {
    consultations = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl text-[var(--text)]">My consultations</h1>
          <p className="mt-2 text-[var(--muted)]">
            Track consultation status, recommendations, and confirmed sessions.
          </p>
        </div>
        <Link
          href="/consultation"
          className="inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628]"
        >
          Book a consultation
        </Link>
      </div>

      {consultations.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
          <p className="text-[var(--muted)]">You have not submitted a consultation yet.</p>
          <Link
            href="/consultation"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Start your consultation →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {consultations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/consultation/${c.id}`}
                className="block rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      {c.condition_description.slice(0, 90)}
                      {c.condition_description.length > 90 ? "…" : ""}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Submitted{" "}
                      {new Date(c.created_at).toLocaleDateString("en-GB", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                {c.status === "recommendation_sent" && (
                  <p className="mt-3 text-sm font-semibold text-[var(--primary)]">
                    Recommendation ready — open to confirm booking →
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
