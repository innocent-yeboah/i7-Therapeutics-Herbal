import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

type Hook = {
  question: string;
  copy: string;
};

const HOOKS: readonly Hook[] = [
  {
    question:
      "Are you ready to finally address the health issue that has been holding you back?",
    copy: "You have dealt with pain, stress, or discomfort for too long. You have tried the quick fixes. You have hoped it would go away on its own. But you are still here. Still searching. That means something. It means you are ready for a real solution.",
  },
  {
    question:
      "Are you frustrated that nothing has worked for your chronic pain or health condition?",
    copy: "You have tried the painkillers, the home remedies, even ignoring it. But the pain is still there. The stress is still there. The frustration is still there. You are tired of temporary fixes that do not last.",
  },
  {
    question: "What if there was a different approach to healing?",
    copy: "We do not guess. We do not rush. We listen first. You tell us your story. We review your case. We recommend therapies that actually fit your needs. You decide what works for you.",
  },
];

/**
 * Home hero for i7 Therapeutics Herbal. Uses three lead generation hooks in a
 * warm, conversational voice so visitors feel understood before they are ever
 * asked to book. The tone stays low pressure and dignity first.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading">
      {/* Welcome band */}
      <div className="relative isolate overflow-hidden border-b border-[var(--border)]">
        <Image
          src="/hero/hero-clinic-session.png"
          alt="i7 Therapeutics therapist providing calm, personalized healing care in a bright Accra clinic"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_38%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a1628]/92 via-[#12233a]/80 to-[#1e3a5f]/55"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-28 lg:py-32">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 backdrop-blur">
            {BRAND.location}
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-serif text-4xl font-medium leading-[1.12] text-balance text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]"
          >
            <span className="sr-only">
              Traditional Healing Therapies for Pain, Stress, and Recovery.{" "}
            </span>
            You have been searching for answers. Let us help you find them.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
            Traditional healing therapies for pain, stress, recovery, and
            wellness.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            <Link
              href="/consultation"
              className="inline-flex items-center justify-center rounded-full bg-[var(--secondary)] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#16304f] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#12233a]"
            >
              Book a Consultation
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:border-white hover:bg-white hover:text-[var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#12233a]"
            >
              Learn More About Our Therapies
            </Link>
          </div>

        </div>
      </div>

      {/* Conversation: the three hooks */}
      <div className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="space-y-12">
            {HOOKS.map((hook) => (
              <div key={hook.question}>
                <h2 className="font-serif text-2xl leading-snug text-[var(--secondary)] sm:text-[1.75rem]">
                  {hook.question}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-[#333333]">
                  {hook.copy}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-[#f4f8f4] px-6 py-10 text-center sm:px-10">
            <p className="font-serif text-2xl text-[var(--secondary)] sm:text-3xl">
              Book a consultation today.
            </p>
            <p className="mt-2 text-lg text-[var(--muted)]">
              No pressure. Just a conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center rounded-full bg-[var(--secondary)] px-8 py-4 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#16304f] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--secondary)] focus-visible:ring-offset-2"
              >
                Book a Consultation
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-full border border-[var(--primary)] px-8 py-4 text-base font-semibold text-[var(--primary)] transition hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                Learn More About Our Therapies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
