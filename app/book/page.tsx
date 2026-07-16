import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book",
  description:
    "Book a consultation with i7 Therapeutics Herbal. We recommend therapies after understanding your needs.",
};

/**
 * Legacy /book route — consultation-first model replaces fixed service booking.
 */
export default function BookPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
        How we book
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[var(--text)]">Start with a consultation</h1>
      <p className="mx-auto mt-4 max-w-lg text-[var(--muted)]">
        We no longer book fixed packages online. Every client begins with a consultation so our
        practitioner can recommend the right therapies, duration, and pricing for your condition.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/consultation"
          className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[#256628]"
        >
          Book a consultation
        </Link>
        <Link
          href="/services"
          className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
        >
          Explore therapies
        </Link>
      </div>
    </div>
  );
}
