import type { Metadata } from "next";
import { HEALING_SERVICES } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { ServiceCard } from "@/components/service-card";

export const metadata: Metadata = {
  title: "Traditional Healing Therapies | i7 Therapeutics Herbal",
  description:
    "Explore our traditional healing therapies in Accra — massage, cupping, sports injury recovery, lymphatic drainage, meridian massage, and more. Book your session today.",
  openGraph: {
    title: "Traditional Healing Therapies | i7 Therapeutics Herbal",
    description:
      "Massage, cupping, sports recovery, and holistic healing therapies tailored to your wellness goals.",
  },
};

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: dbServices } = await supabase.from("services").select("id, slug, name");

  const slugToId = new Map(
    (dbServices ?? [])
      .filter((s) => s.slug)
      .map((s) => [s.slug as string, s.id])
  );

  // Fallback: match by name for services without slug column populated yet
  for (const svc of dbServices ?? []) {
    const match = HEALING_SERVICES.find(
      (h) => h.name.toLowerCase() === svc.name.toLowerCase()
    );
    if (match && !slugToId.has(match.slug)) {
      slugToId.set(match.slug, svc.id);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "i7 Therapeutics Herbal",
    description: metadata.description,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Traditional Healing Therapies",
      itemListElement: HEALING_SERVICES.map((s, i) => ({
        "@type": "Offer",
        position: i + 1,
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.shortDescription,
          url: `https://i7therapeuticsherbal.com/services/${s.slug}`,
        },
      })),
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
          Traditional Healing Therapies
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[var(--text)] sm:text-5xl">
          Our services
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
          Each session is tailored to your body, mind, and goals — from restorative massage and
          cupping to sports recovery and meridian bodywork. Explore our therapies and book the care
          that fits you.
        </p>
      </header>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {HEALING_SERVICES.map((service) => (
          <ServiceCard
            key={service.slug}
            service={service}
            supabaseId={slugToId.get(service.slug)}
          />
        ))}
      </div>
    </div>
  );
}
