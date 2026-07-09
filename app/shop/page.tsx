import Link from "next/link";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata = {
  title: "Shop Coming Soon",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <span className="inline-flex items-center rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Coming soon
        </span>
        <h1 className="mt-4 font-serif text-4xl text-[var(--text)] sm:text-5xl">
          Our herbal shop is on the way
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-[var(--muted)]">
          We are preparing a thoughtful collection of herbal teas, therapeutic oils, meditation
          support, and self-healing essentials. Join the waitlist today and be the first to know
          when each offering becomes available.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#coming-soon"
            className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#256628]"
          >
            View upcoming offerings
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            Contact our team
          </Link>
        </div>
      </header>
      <ComingSoon />
    </div>
  );
}
