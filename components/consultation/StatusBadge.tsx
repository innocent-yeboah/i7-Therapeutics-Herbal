import type { ConsultationStatus } from "@/lib/types/database";
import { consultationStatusLabels } from "@/lib/consultation";

const styles: Record<ConsultationStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  reviewed: "bg-sky-50 text-sky-800 ring-sky-200",
  recommendation_sent: "bg-violet-50 text-violet-800 ring-violet-200",
  booking_confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  completed: "bg-green-50 text-green-900 ring-green-200",
  cancelled: "bg-red-50 text-red-800 ring-red-200",
};

export function StatusBadge({ status }: { status: ConsultationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      {consultationStatusLabels[status]}
    </span>
  );
}
