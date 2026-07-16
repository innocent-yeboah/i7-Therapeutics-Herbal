import type { ConsultationRequestRow } from "@/lib/types/database";
import Link from "next/link";

export function RecommendationCard({
  consultation,
  confirmHref,
}: {
  consultation: ConsultationRequestRow;
  confirmHref?: string;
}) {
  const therapies = consultation.recommended_therapies ?? [];
  const price =
    consultation.recommended_price != null
      ? Number(consultation.recommended_price).toFixed(0)
      : null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h3 className="font-serif text-xl text-[var(--text)]">Your recommendation</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Prepared by our practitioner based on your consultation.
      </p>

      {therapies.length > 0 && (
        <ul className="mt-4 space-y-2">
          {therapies.map((therapy) => (
            <li key={therapy} className="flex items-start gap-2 text-sm text-[var(--text)]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
              {therapy}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {consultation.recommended_duration && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Duration
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--text)]">
              {consultation.recommended_duration}
            </dd>
          </div>
        )}
        {price && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Investment
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--secondary)]">GHS {price}</dd>
          </div>
        )}
      </dl>

      {consultation.recommendation_notes?.trim() && (
        <div className="mt-5 rounded-xl bg-[#f4f7fb] p-4 text-sm leading-relaxed text-[var(--muted)]">
          {consultation.recommendation_notes}
        </div>
      )}

      {confirmHref && consultation.status === "recommendation_sent" && (
        <Link
          href={confirmHref}
          className="mt-6 inline-flex rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628]"
        >
          Confirm booking
        </Link>
      )}
    </div>
  );
}
