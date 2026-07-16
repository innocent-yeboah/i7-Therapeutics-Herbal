"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  consultationCreateSchema,
  type ConsultationCreateInput,
} from "@/lib/consultation";

const steps = [
  { id: 1, title: "Contact", blurb: "How we can reach you" },
  { id: 2, title: "Health", blurb: "Tell us about your condition" },
  { id: 3, title: "Review", blurb: "Confirm and submit" },
] as const;

type FormValues = ConsultationCreateInput;

export function ConsultationForm({
  defaultEmail,
  defaultName,
  defaultPhone,
}: {
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(consultationCreateSchema),
    defaultValues: {
      client_name: defaultName ?? "",
      client_email: defaultEmail ?? "",
      client_phone: defaultPhone ?? "",
      preferred_contact: "whatsapp",
      preferred_date: "",
      preferred_time: "",
      condition_description: "",
      symptoms: "",
      duration_of_condition: "",
      previous_treatments: "",
      current_medications: "",
      allergies: "",
      desired_outcome: "",
      additional_notes: "",
    },
  });

  const values = watch();

  const stepFields = useMemo(
    () =>
      ({
        1: [
          "client_name",
          "client_email",
          "client_phone",
          "preferred_contact",
          "preferred_date",
          "preferred_time",
        ] as const,
        2: [
          "condition_description",
          "symptoms",
          "duration_of_condition",
          "previous_treatments",
          "current_medications",
          "allergies",
          "desired_outcome",
          "additional_notes",
        ] as const,
        3: [] as const,
      }) as const,
    []
  );

  const goNext = async () => {
    setServerError(null);
    if (step === 1 || step === 2) {
      const ok = await trigger([...stepFields[step]]);
      if (!ok) return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          preferred_date: data.preferred_date || null,
          preferred_time: data.preferred_time || null,
          symptoms: data.symptoms || null,
          duration_of_condition: data.duration_of_condition || null,
          previous_treatments: data.previous_treatments || null,
          current_medications: data.current_medications || null,
          allergies: data.allergies || null,
          desired_outcome: data.desired_outcome || null,
          additional_notes: data.additional_notes || null,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; id?: string };
      if (!res.ok || !json.ok) {
        setServerError(json.error || "Could not submit your consultation. Please try again.");
        return;
      }
      router.push(`/consultation/confirmation?id=${json.id ?? ""}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
      <ol className="mb-8 flex flex-wrap gap-2">
        {steps.map((s) => (
          <li
            key={s.id}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              step === s.id
                ? "bg-[var(--primary)] text-white"
                : step > s.id
                  ? "bg-[#eef7ef] text-[var(--primary)]"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {s.id}. {s.title}
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">Contact details</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{steps[0].blurb}</p>
            </div>
            <Field label="Full name" error={errors.client_name?.message}>
              <input
                className={inputClass}
                autoComplete="name"
                {...register("client_name")}
              />
            </Field>
            <Field label="Email address" error={errors.client_email?.message}>
              <input
                type="email"
                className={inputClass}
                autoComplete="email"
                {...register("client_email")}
              />
            </Field>
            <Field label="Phone number" error={errors.client_phone?.message}>
              <input
                type="tel"
                className={inputClass}
                autoComplete="tel"
                {...register("client_phone")}
              />
            </Field>
            <Field label="Preferred contact method" error={errors.preferred_contact?.message}>
              <select className={inputClass} {...register("preferred_contact")}>
                <option value="whatsapp">WhatsApp</option>
                <option value="call">Phone call</option>
                <option value="email">Email</option>
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preferred date (optional)">
                <input type="date" className={inputClass} {...register("preferred_date")} />
              </Field>
              <Field label="Preferred time (optional)">
                <input type="time" className={inputClass} {...register("preferred_time")} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">Health information</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Help us understand your needs before recommending therapy.
              </p>
            </div>
            <Field
              label="Describe your condition"
              error={errors.condition_description?.message}
              required
            >
              <textarea
                rows={5}
                className={inputClass}
                placeholder="What brings you in? Where do you feel discomfort or imbalance?"
                {...register("condition_description")}
              />
            </Field>
            <Field label="What symptoms are you experiencing?">
              <textarea rows={3} className={inputClass} {...register("symptoms")} />
            </Field>
            <Field label="How long have you had this condition?">
              <input className={inputClass} {...register("duration_of_condition")} />
            </Field>
            <Field label="Have you had any previous treatments?">
              <textarea rows={3} className={inputClass} {...register("previous_treatments")} />
            </Field>
            <Field label="Are you currently on any medications?">
              <textarea rows={2} className={inputClass} {...register("current_medications")} />
            </Field>
            <Field label="Do you have any allergies?">
              <textarea rows={2} className={inputClass} {...register("allergies")} />
            </Field>
            <Field label="What is your desired outcome?">
              <textarea rows={3} className={inputClass} {...register("desired_outcome")} />
            </Field>
            <Field label="Additional notes">
              <textarea rows={2} className={inputClass} {...register("additional_notes")} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)]">Review & submit</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Confirm your details. Our practitioner will review within 24 hours.
              </p>
            </div>
            <dl className="space-y-3 rounded-xl bg-[#fafafa] p-4 text-sm">
              <ReviewRow label="Name" value={values.client_name} />
              <ReviewRow label="Email" value={values.client_email} />
              <ReviewRow label="Phone" value={values.client_phone} />
              <ReviewRow label="Preferred contact" value={values.preferred_contact} />
              <ReviewRow
                label="Preferred schedule"
                value={
                  [values.preferred_date, values.preferred_time].filter(Boolean).join(" · ") ||
                  "Flexible"
                }
              />
              <ReviewRow label="Condition" value={values.condition_description} />
              {values.desired_outcome && (
                <ReviewRow label="Desired outcome" value={values.desired_outcome} />
              )}
            </dl>
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              By submitting, you agree that we may contact you about your consultation using your
              preferred method. Your health information is kept confidential.
            </p>
          </div>
        )}

        {serverError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628]"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628] disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit consultation request"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/30";

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--text)]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-[var(--text)]">{value}</dd>
    </div>
  );
}
