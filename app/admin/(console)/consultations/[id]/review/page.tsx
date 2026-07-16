import { RecommendationForm } from "@/components/consultation/RecommendationForm";
import { StatusBadge } from "@/components/consultation/StatusBadge";
import { ConsultationTimeline } from "@/components/consultation/ConsultationTimeline";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import type { ConsultationRequestRow, TherapyServiceRow } from "@/lib/types/database";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function AdminConsultationReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", user!.id)
    .single();

  const [{ data: consultation }, { data: therapies }] = await Promise.all([
    supabase.from("consultation_requests").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("therapy_services")
      .select("id, name, slug, description, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (!consultation) notFound();

  const c = consultation as ConsultationRequestRow;
  const therapyList = ((therapies as TherapyServiceRow[]) ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  return (
    <div>
      <AdminHeader
        title={`Review — ${c.client_name}`}
        subtitle="Review the client's condition and send a therapy recommendation."
        displayName={profile?.name ?? ""}
        userEmail={user?.email ?? ""}
      />

      <div className="mt-2">
        <Link
          href="/admin/consultations"
          className="text-sm font-semibold text-emerald-700 hover:underline"
        >
          ← All consultations
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={c.status} />
        <span className="text-sm text-slate-500">
          Submitted{" "}
          {new Date(c.created_at).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Client information</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Item label="Name" value={c.client_name} />
              <Item label="Email" value={c.client_email} />
              <Item label="Phone" value={c.client_phone} />
              <Item label="Preferred contact" value={c.preferred_contact} />
              <Item label="Preferred date" value={c.preferred_date} />
              <Item label="Preferred time" value={c.preferred_time} />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Health information</h2>
            <div className="mt-4 space-y-4 text-sm">
              <Block title="Condition" body={c.condition_description} />
              <Block title="Symptoms" body={c.symptoms} />
              <Block title="Duration of condition" body={c.duration_of_condition} />
              <Block title="Previous treatments" body={c.previous_treatments} />
              <Block title="Current medications" body={c.current_medications} />
              <Block title="Allergies" body={c.allergies} />
              <Block title="Desired outcome" body={c.desired_outcome} />
              <Block title="Additional notes" body={c.additional_notes} />
            </div>
          </section>

          <RecommendationForm
            consultationId={c.id}
            therapies={therapyList}
            initial={{
              recommended_therapies: c.recommended_therapies,
              recommended_duration: c.recommended_duration,
              recommended_price: c.recommended_price,
              recommendation_notes: c.recommendation_notes,
            }}
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <div className="mt-4">
              <ConsultationTimeline consultation={c} />
            </div>
          </div>

          {c.status === "booking_confirmed" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm">
              <h2 className="font-semibold text-slate-900">Confirmed booking</h2>
              <dl className="mt-3 space-y-2">
                <Item label="Therapy" value={c.confirmed_therapy} />
                <Item label="Duration" value={c.confirmed_duration} />
                <Item
                  label="Price"
                  value={
                    c.confirmed_price != null
                      ? `GHS ${Number(c.confirmed_price).toFixed(0)}`
                      : null
                  }
                />
                <Item label="Date" value={c.confirmed_date} />
                <Item label="Time" value={c.confirmed_time} />
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body?: string | null }) {
  if (!body?.trim()) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-slate-800">{body}</p>
    </div>
  );
}
