import Image from "next/image";
import Link from "next/link";
import type { HealingService } from "@/lib/services";
import { getServiceBookingHref, getServiceInquireHref } from "@/lib/services";

export function ServiceCard({
  service,
  supabaseId,
}: {
  service: HealingService;
  supabaseId?: string | null;
}) {
  const bookHref = getServiceBookingHref(service.slug, supabaseId);
  const inquireHref = getServiceInquireHref(service.name);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/services/${service.slug}`} className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width:1024px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <Link href={`/services/${service.slug}`}>
          <h2 className="font-serif text-xl text-[var(--text)] transition group-hover:text-[var(--primary)] sm:text-2xl">
            {service.name}
          </h2>
        </Link>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
          {service.shortDescription}
        </p>

        {service.benefits.length > 0 && (
          <ul className="mt-4 space-y-1">
            {service.benefits.slice(0, 3).map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" />
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
          <div className="ml-auto flex flex-wrap gap-2">
            <Link
              href={`/services/${service.slug}`}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Learn more
            </Link>
            {service.bookable ? (
              <Link
                href={bookHref}
                className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#256628]"
              >
                Book consultation
              </Link>
            ) : (
              <a
                href={inquireHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[var(--secondary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#162d49]"
              >
                Inquire
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
