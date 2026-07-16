import { ConfirmBookingForm } from "@/components/consultation/ConfirmBookingForm";
import { ConsultationTimeline } from "@/components/consultation/ConsultationTimeline";
import { RecommendationCard } from "@/components/consultation/RecommendationCard";
import { StatusBadge } from "@/components/consultation/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import type { ConsultationRequestRow } from "@/lib/types/database";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
};

export default async function ConsultationDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { confirmed } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/account/login?next=/dashboard/consultation/${id}`);
  }

  let consultation: ConsultationRequestRow | null = null;
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("consultation_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    consultation = (data as ConsultationRequestRow) ?? null;
  } catch {
    consultation = null;
  }

  if (!consultation) notFound();

  const email = (user.email ?? "").toLowerCase();
  const owns =
    consultation.user_id === user.id ||
    consultation.client_email.toLowerCase() === email;

  if (!owns) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/dashboard" className="text-sm font-semibold text-[var(--primary)] hover:underline">
        ← Back to consultations
      </Link>

      {confirmed === "1" && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Your session is confirmed. We look forward to seeing you.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[var(--text)]">Consultation details</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Submitted{" "}
            {new Date(consultation.created_at).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <StatusBadge status={consultation.status} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-xl text-[var(--text)]">Your information</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Name" value={consultation.client_name} />
              <Info label="Email" value={consultation.client_email} />
              <Info label="Phone" value={consultation.client_phone} />
              <Info label="Preferred contact" value={consultation.preferred_contact} />
            </dl>
            <div className="mt-6 space-y-4 text-sm">
              <Block title="Condition" body={consultation.condition_description} />
              <Block title="Symptoms" body={consultation.symptoms} />
              <Block title="Duration of condition" body={consultation.duration_of_condition} />
              <Block title="Previous treatments" body={consultation.previous_treatments} />
              <Block title="Medications" body={consultation.current_medications} />
              <Block title="Allergies" body={consultation.allergies} />
              <Block title="Desired outcome" body={consultation.desired_outcome} />
              <Block title="Additional notes" body={consultation.additional_notes} />
            </div>
          </section>

          {(consultation.recommended_therapies?.length ||
            consultation.status === "recommendation_sent" ||
            consultation.status === "booking_confirmed" ||
            consultation.status === "completed") && (
            <RecommendationCard consultation={consultation} />
          )}

          {consultation.status === "recommendation_sent" && (
            <ConfirmBookingForm consultation={consultation} />
          )}

          {consultation.status === "booking_confirmed" && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
              <h2 className="font-serif text-xl text-[var(--text)]">Confirmed session</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Therapy" value={consultation.confirmed_therapy} />
                <Info label="Duration" value={consultation.confirmed_duration} />
                <Info
                  label="Investment"
                  value={
                    consultation.confirmed_price != null
                      ? `GHS ${Number(consultation.confirmed_price).toFixed(0)}`
                      : null
                  }
                />
                <Info label="Date" value={consultation.confirmed_date} />
                <Info label="Time" value={consultation.confirmed_time} />
              </dl>
            </section>
          )}
        </div>

        <aside className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[var(--text)]">Timeline</h2>
          <div className="mt-4">
            <ConsultationTimeline consultation={consultation} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 text-[var(--text)]">{value}</dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body?: string | null }) {
  if (!body?.trim()) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-[var(--text)]">{body}</p>
    </div>
  );
}
