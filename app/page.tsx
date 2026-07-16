import Image from "next/image";
import Link from "next/link";
import { HEALING_SERVICES } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";
import { HeroSlider } from "@/components/hero-slider";
import { ServiceCard } from "@/components/service-card";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: dbServices }, { data: products }] = await Promise.all([
    supabase.from("services").select("id, slug, name"),
    supabase.from("products").select("*").limit(3),
  ]);

  const slugToId = new Map(
    (dbServices ?? [])
      .filter((s) => s.slug)
      .map((s) => [s.slug as string, s.id])
  );

  const featuredServices = HEALING_SERVICES.slice(0, 3);

  return (
    <div>
      <HeroSlider />

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

      <section className="border-b border-[var(--border)] bg-[#fafafa] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-[var(--text)]">Herbal shop</h2>
              <p className="mt-2 text-[var(--muted)]">
                Oils, teas, and daily support crafted with botanical care.
              </p>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-[var(--primary)] hover:underline">
              Visit shop →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {(products ?? []).map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square">
                  <Image
                    src={p.image || "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80"}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-[var(--text)]">{p.name}</h3>
                  <Link
                    href="/shop"
                    className="mt-3 inline-block text-sm text-[var(--primary)] hover:underline"
                  >
                    View in shop →
                  </Link>
                </div>
              </article>
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
