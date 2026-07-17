import type { Metadata } from "next";
import Link from "next/link";
import { HEALING_SERVICES } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/Hero";
import { ServiceCard } from "@/components/service-card";

export const metadata: Metadata = {
  title: "Traditional Healing Therapies for Pain, Stress, and Recovery",
  description:
    "Book a consultation for personalized healing therapies. We listen first, then recommend what works for you.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: dbServices } = await supabase
    .from("services")
    .select("id, slug, name");

  const slugToId = new Map(
    (dbServices ?? [])
      .filter((s) => s.slug)
      .map((s) => [s.slug as string, s.id])
  );

  const featuredServices = HEALING_SERVICES.slice(0, 3);

  return (
    <div>
      <Hero />

      <section className="border-b border-[var(--border)] bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-[var(--text)]">Traditional Healing Therapies</h2>
              <p className="mt-2 text-[var(--muted)]">
                Massage, cupping, sports recovery, and holistic bodywork tailored to you.
              </p>
            </div>
            <Link
              href="/services"
              className="text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              View all services →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s) => (
              <ServiceCard
                key={s.slug}
                service={s}
                supabaseId={slugToId.get(s.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-gradient-to-r from-[#eef7ef] to-[#e8eef5] py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[var(--text)]">Begin your wellness journey</h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--muted)]">
            Tell us what you need — a healing session, a custom herbal plan, or a mindful reset.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/consultation"
              className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#256628]"
            >
              Book a consultation
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
            >
              Coming soon offerings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
