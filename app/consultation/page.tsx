import { ConsultationForm } from "@/components/consultation/ConsultationForm";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Book a consultation with i7 Therapeutics Herbal. Share your condition and receive a personalized therapy recommendation.",
};

export default async function ConsultationPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultName = "";
  let defaultPhone = "";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, phone")
      .eq("id", user.id)
      .maybeSingle();
    defaultName = profile?.name ?? "";
    defaultPhone = profile?.phone ?? "";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
          Consultation-first care
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[var(--text)]">Book a consultation</h1>
        <p className="mt-3 max-w-2xl text-[var(--muted)]">
          Every client is unique. Tell us about your condition and our practitioner will recommend
          the right therapies, duration, and investment — then you confirm your session.
        </p>
        <ol className="mt-6 grid gap-3 text-sm text-[var(--muted)] sm:grid-cols-3">
          <li className="rounded-xl border border-[var(--border)] bg-white p-4">
            <span className="font-semibold text-[var(--text)]">1. Share your needs</span>
            <p className="mt-1">Describe your condition and goals.</p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-white p-4">
            <span className="font-semibold text-[var(--text)]">2. Receive a plan</span>
            <p className="mt-1">We recommend therapies within 24 hours.</p>
          </li>
          <li className="rounded-xl border border-[var(--border)] bg-white p-4">
            <span className="font-semibold text-[var(--text)]">3. Confirm your session</span>
            <p className="mt-1">Choose a date and time that works for you.</p>
          </li>
        </ol>
      </div>

      <ConsultationForm
        defaultEmail={user?.email ?? ""}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
      />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already submitted a request?{" "}
        <Link href="/dashboard" className="font-semibold text-[var(--primary)] hover:underline">
          View your consultations
        </Link>
      </p>
    </div>
  );
}
