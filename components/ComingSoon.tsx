import Image from "next/image";
import { COMING_SOON_OFFERINGS } from "@/lib/services";
import { WaitlistForm } from "@/components/waitlist-form";

export function ComingSoon() {
  return (
    <section
      id="coming-soon"
      className="mt-20 scroll-mt-24 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#eef7ef] via-white to-[#e8eef5] p-6 sm:p-10"
    >
      <div className="max-w-2xl">
        <span className="inline-flex items-center rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Coming soon
        </span>
        <h2 className="mt-4 font-serif text-3xl text-[var(--text)] sm:text-4xl">
          New offerings on the horizon
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          We are preparing herbal teas, therapeutic oils, meditation sessions, and self-healing
          workshops. Join the waitlist to be first to know when they launch.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {COMING_SOON_OFFERINGS.map((offering) => (
          <article
            key={offering.slug}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={offering.image}
                alt={offering.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--secondary)] shadow-sm backdrop-blur">
                Coming soon
              </span>
              <h3 className="absolute bottom-4 left-4 font-serif text-xl text-white">
                {offering.name}
              </h3>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-[var(--muted)]">{offering.description}</p>
              <WaitlistForm
                offeringSlug={offering.slug}
                offeringName={offering.name}
                compact
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
