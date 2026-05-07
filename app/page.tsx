import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { HeroSlider } from "@/components/hero-slider";

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: services }, { data: products }, { data: testimonials }] = await Promise.all([
    supabase.from("services").select("*").limit(3),
    supabase.from("products").select("*").limit(3),
    supabase.from("testimonials").select("*").eq("approved", true).limit(6),
  ]);

  return (
    <div>
      <HeroSlider />

      <section className="border-b border-[var(--border)] bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl text-[var(--text)]">Services</h2>
              <p className="mt-2 text-[var(--muted)]">
                Personalized care across TCM, massage, reflexology, and more.
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
            {(services ?? []).map((s) => (
              <article
                key={s.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-video">
                  <Image
                    src={s.image || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"}
                    alt={s.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-serif text-xl text-[var(--text)]">{s.name}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--muted)]">
                    {s.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--secondary)]">
                      GHS {Number(s.price).toFixed(0)}
                    </span>
                    <Link
                      href={`/book?service=${s.id}`}
                      className="rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[#256628]"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </article>
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
                  <p className="mt-1 text-sm font-semibold text-[var(--secondary)]">
                    GHS {Number(p.price).toFixed(0)}
                  </p>
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl text-[var(--text)]">Loved by our community</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(testimonials ?? []).map((t) => (
              <figure
                key={t.id}
                className="rounded-2xl border border-[var(--border)] bg-[#fafafa] p-6 transition hover:shadow-md"
              >
                <blockquote className="text-sm leading-relaxed text-[var(--muted)]">
                  “{t.content}”
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-[var(--text)]">
                  {t.client_name}
                  <span className="ml-2 text-[var(--primary)]">{"★".repeat(t.rating)}</span>
                </figcaption>
              </figure>
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
              href="/contact"
              className="rounded-full bg-[var(--secondary)] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#162d49]"
            >
              Contact us
            </Link>
            <Link
              href={BRAND.instagram}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)]"
            >
              Instagram
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
