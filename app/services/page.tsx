import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl text-[var(--text)]">Our services</h1>
        <p className="mt-3 text-[var(--muted)]">
          Each session is tailored to your goals — from traditional Chinese medicine to restorative
          massage and online tutoring.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {(services ?? []).map((s) => (
          <article
            key={s.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:flex-row"
          >
            <div className="relative aspect-video w-full shrink-0 lg:w-2/5 lg:aspect-auto lg:min-h-[220px]">
              <Image
                src={
                  s.image ||
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
                }
                alt={s.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width:1024px) 100vw, 40vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="font-serif text-2xl text-[var(--text)]">{s.name}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {s.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[var(--border)] pt-4">
                <div className="text-sm text-[var(--muted)]">
                  <span className="font-semibold text-[var(--secondary)]">
                    GHS {Number(s.price).toFixed(0)}
                  </span>
                  <span className="mx-2">·</span>
                  <span>{s.duration_minutes} min</span>
                </div>
                <Link
                  href={`/book?service=${s.id}`}
                  className="ml-auto rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#256628]"
                >
                  Book now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
