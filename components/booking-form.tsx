"use client";

import { createAppointment, getBookedSlotsForDate } from "@/app/actions/booking";
import { generateDaySlots, formatSlotLabel } from "@/lib/slots";
import type { ServiceRow } from "@/lib/types/database";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

const schema = z.object({
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function BookingForm({
  services,
  preselectedServiceId,
}: {
  services: ServiceRow[];
  preselectedServiceId?: string;
}) {
  const [value, onChange] = useState<Value>(new Date());
  const dateStr = useMemo(() => {
    const d = Array.isArray(value) ? value[0] : value;
    if (!d) return format(new Date(), "yyyy-MM-dd");
    return format(d, "yyyy-MM-dd");
  }, [value]);

  const [serviceId, setServiceId] = useState(
    preselectedServiceId && services.some((s) => s.id === preselectedServiceId)
      ? preselectedServiceId
      : services[0]?.id ?? ""
  );

  const [booked, setBooked] = useState<string[]>([]);
  const [slot, setSlot] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allSlots = useMemo(() => generateDaySlots(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const taken = await getBookedSlotsForDate(dateStr);
      if (!cancelled) setBooked(taken);
    })();
    return () => {
      cancelled = true;
    };
  }, [dateStr]);

  const available = useMemo(
    () => allSlots.filter((t) => !booked.includes(t)),
    [allSlots, booked]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit((vals) => {
    setMessage(null);
    if (!serviceId) {
      setMessage("Please choose a service.");
      return;
    }
    if (!slot) {
      setMessage("Please choose a time.");
      return;
    }
    startTransition(async () => {
      const res = await createAppointment({
        service_id: serviceId,
        appointment_date: dateStr,
        appointment_time: slot,
        notes: vals.notes,
      });
      if (res.ok) {
        setMessage("Request received! We will confirm your appointment shortly.");
        reset();
        setSlot("");
        const taken = await getBookedSlotsForDate(dateStr);
        setBooked(taken);
      } else {
        setMessage(res.error);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-[var(--text)]">Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — GHS {Number(s.price).toFixed(0)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--text)]">Date</label>
          <div className="mt-3 flex justify-center sm:justify-start">
            <Calendar
              onChange={onChange}
              value={value}
              minDate={new Date()}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div>
          <label className="text-sm font-medium text-[var(--text)]">Available times</label>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Times shown in local hours. Each slot is reserved exclusively once confirmed.
          </p>
          <div className="mt-3 grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
            {available.length === 0 ? (
              <p className="col-span-full text-sm text-[var(--muted)]">
                No open slots for this date. Try another day.
              </p>
            ) : (
              available.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSlot(t)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    slot === t
                      ? "border-[var(--primary)] bg-[#eef7ef] font-semibold text-[var(--primary)]"
                      : "border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  {formatSlotLabel(t)}
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="text-sm font-medium text-[var(--text)]">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            {...register("notes")}
            className="mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none ring-[var(--primary)] focus:ring-2"
            placeholder="Share goals, sensitivities, or questions."
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.includes("received") ? "text-[var(--primary)]" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-[var(--primary)] py-3 text-sm font-semibold text-white transition hover:bg-[#256628] disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Request appointment"}
        </button>
      </div>
    </form>
  );
}
