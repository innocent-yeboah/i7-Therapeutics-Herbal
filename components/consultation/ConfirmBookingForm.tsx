"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ConsultationRequestRow } from "@/lib/types/database";
import { generateDaySlots, formatSlotLabel } from "@/lib/slots";

export function ConfirmBookingForm({
  consultation,
}: {
  consultation: ConsultationRequestRow;
}) {
  const router = useRouter();
  const [date, setDate] = useState(consultation.preferred_date ?? "");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slots = generateDaySlots();
  const therapies = (consultation.recommended_therapies ?? []).join(", ");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/consultation/${consultation.id}/confirm`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed_date: date,
          confirmed_time: time,
          client_email: consultation.client_email,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not confirm booking.");
        return;
      }
      router.push(`/dashboard/consultation/${consultation.id}?confirmed=1`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-serif text-2xl text-[var(--text)]">Confirm your session</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose a date and time for: <strong>{therapies}</strong>
        </p>
        <p className="mt-2 text-sm text-[var(--text)]">
          {consultation.recommended_duration}
          {consultation.recommended_price != null && (
            <>
              {" "}
              · <span className="font-semibold text-[var(--secondary)]">
                GHS {Number(consultation.recommended_price).toFixed(0)}
              </span>
            </>
          )}
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text)]" htmlFor="confirmed_date">
          Session date
        </label>
        <input
          id="confirmed_date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--text)]" htmlFor="confirmed_time">
          Session time
        </label>
        <select
          id="confirmed_time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          <option value="">Select a time</option>
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {formatSlotLabel(slot)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628] disabled:opacity-60"
      >
        {loading ? "Confirming…" : "Confirm booking"}
      </button>
    </form>
  );
}
