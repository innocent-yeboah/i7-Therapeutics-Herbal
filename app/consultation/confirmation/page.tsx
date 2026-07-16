import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation received",
};

export default async function ConsultationConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef7ef] text-[var(--primary)]">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="mt-6 font-serif text-4xl text-[var(--text)]">Thank you for booking a consultation</h1>
      <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">
        We will review your request within <strong className="text-[var(--text)]">24 hours</strong>.
        You will receive a personalized recommendation via your preferred contact method.
      </p>

      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 text-left shadow-sm">
        <h2 className="font-serif text-xl text-[var(--text)]">What to expect next</h2>
        <ol className="mt-4 space-y-3 text-sm text-[var(--muted)]">
          <li>
            <strong className="text-[var(--text)]">1.</strong> Our practitioner reviews your
            condition and health notes.
          </li>
          <li>
            <strong className="text-[var(--text)]">2.</strong> You receive recommended therapies,
            duration, and pricing.
          </li>
          <li>
            <strong className="text-[var(--text)]">3.</strong> Confirm your preferred date and time
            to schedule the session.
          </li>
        </ol>
        {id && (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Reference: <span className="font-mono text-[var(--text)]">{id}</span>
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#256628]"
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
