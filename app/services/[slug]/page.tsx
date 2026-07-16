import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  HEALING_SERVICES,
  getAllServiceSlugs,
  getServiceBySlug,
  getServiceBookingHref,
  getServiceInquireHref,
} from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      images: [{ url: service.image, alt: service.name }],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const supabase = await createClient();
  const { data: dbService } = await supabase
    .from("services")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();

  let supabaseId = dbService?.id ?? null;
  if (!supabaseId) {
    const { data: byName } = await supabase
      .from("services")
      .select("id")
      .ilike("name", service.name)
      .maybeSingle();
    supabaseId = byName?.id ?? null;
  }

  const bookHref = getServiceBookingHref(service.slug, supabaseId);
  const inquireHref = getServiceInquireHref(service.name);

  const related = HEALING_SERVICES.filter((s) => s.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.fullDescription,
    provider: {
      "@type": "MedicalBusiness",
      name: BRAND.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
    },
    offers: {
      "@type": "Offer",
      description: "Personalized after consultation",
      priceCurrency: "GHS",
      url: `${BRAND.websiteUrl}/consultation`,
    },
    image: service.image,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative h-64 sm:h-80 lg:h-96">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl text-white sm:text-5xl">{service.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">
            {service.shortDescription}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <section>
              <h2 className="font-serif text-2xl text-[var(--text)]">About this therapy</h2>
              <p className="mt-4 leading-relaxed text-[var(--muted)]">{service.fullDescription}</p>
            </section>

            {service.benefits.length > 0 && (
              <section className="mt-10">
                <h2 className="font-serif text-2xl text-[var(--text)]">Benefits</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[#fafafa] px-4 py-3 text-sm text-[var(--text)]"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {service.indications && service.indications.length > 0 && (
              <section className="mt-10">
                <h2 className="font-serif text-2xl text-[var(--text)]">Indications</h2>
                <ul className="mt-4 space-y-2">
                  {service.indications.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                      <span className="mt-1.5 text-[var(--secondary)]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {service.subtypes && service.subtypes.length > 0 && (
              <section className="mt-10">
                <h2 className="font-serif text-2xl text-[var(--text)]">Treatment options</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {service.subtypes.map((subtype) => (
                    <div
                      key={subtype.name}
                      className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-semibold text-[var(--secondary)]">{subtype.name}</h3>
                      <ul className="mt-3 space-y-1.5">
                        {subtype.indications.map((ind) => (
                          <li key={ind} className="text-sm text-[var(--muted)]">
                            · {ind}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <p className="text-sm text-[var(--muted)]">Consultation-first care</p>
              <p className="mt-2 font-serif text-xl text-[var(--text)]">Personalized plan</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                Duration and investment are confirmed after your consultation, based on your
                condition and recommended therapies.
              </p>

              <div className="mt-6 space-y-3">
                {service.bookable ? (
                  <Link
                    href={bookHref}
                    className="block w-full rounded-full bg-[var(--primary)] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#256628]"
                  >
                    Book a consultation
                  </Link>
                ) : (
                  <a
                    href={inquireHref}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full rounded-full bg-[var(--secondary)] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#162d49]"
                  >
                    Call to inquire
                  </a>
                )}
                <Link
                  href="/contact"
                  className="block w-full rounded-full border border-[var(--border)] py-3 text-center text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Ask a question
                </Link>
              </div>

              <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
                Sessions are tailored to your needs. We will confirm your appointment by email or
                WhatsApp after booking.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-16 border-t border-[var(--border)] pt-12">
          <h2 className="font-serif text-2xl text-[var(--text)]">You may also like</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="font-medium text-[var(--text)] group-hover:text-[var(--primary)]">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
