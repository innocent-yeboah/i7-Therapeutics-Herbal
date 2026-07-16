import type { ConsultationRequestRow } from "@/lib/types/database";

type Step = {
  key: string;
  label: string;
  at: string | null | undefined;
  done: boolean;
};

export function ConsultationTimeline({ consultation }: { consultation: ConsultationRequestRow }) {
  const steps: Step[] = [
    {
      key: "submitted",
      label: "Submitted",
      at: consultation.created_at,
      done: true,
    },
    {
      key: "reviewed",
      label: "Reviewed",
      at: consultation.reviewed_at,
      done: Boolean(
        consultation.reviewed_at ||
          ["reviewed", "recommendation_sent", "booking_confirmed", "completed"].includes(
            consultation.status
          )
      ),
    },
    {
      key: "recommendation",
      label: "Recommendation sent",
      at: consultation.recommendation_sent_at,
      done: Boolean(
        consultation.recommendation_sent_at ||
          ["recommendation_sent", "booking_confirmed", "completed"].includes(consultation.status)
      ),
    },
    {
      key: "confirmed",
      label: "Booking confirmed",
      at: consultation.booking_confirmed_at,
      done: Boolean(
        consultation.booking_confirmed_at ||
          ["booking_confirmed", "completed"].includes(consultation.status)
      ),
    },
    {
      key: "completed",
      label: "Completed",
      at: consultation.completed_at,
      done: consultation.status === "completed" || Boolean(consultation.completed_at),
    },
  ];

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step.done
                  ? "bg-[var(--primary)] text-white"
                  : "bg-slate-100 text-slate-400 ring-1 ring-slate-200"
              }`}
            >
              {index + 1}
            </span>
            {index < steps.length - 1 && (
              <span
                className={`mt-1 w-0.5 flex-1 min-h-[1.25rem] ${
                  step.done ? "bg-[var(--primary)]/40" : "bg-slate-200"
                }`}
              />
            )}
          </div>
          <div className="pb-2">
            <p className={`text-sm font-semibold ${step.done ? "text-[var(--text)]" : "text-slate-400"}`}>
              {step.label}
            </p>
            {step.at ? (
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {new Date(step.at).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400">Awaiting</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
