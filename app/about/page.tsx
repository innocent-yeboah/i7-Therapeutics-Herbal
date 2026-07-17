import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-serif text-4xl text-[var(--text)]">Our story</h1>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            {BRAND.name} was founded to make ancestral herbal knowledge accessible alongside modern
            wellness practices. From our hub at {BRAND.location}, we blend traditional medicine,
            mindful bodywork, and practical nutrition so you can feel supported at every stage.
          </p>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">
            We believe healing is relational: clear explanations, gentle accountability, and
            botanicals chosen with integrity. Whether you visit for reflexology or join an online
            tutoring circle, you will be met with patience and respect.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/about/about-therapist.jpg"
            alt="i7 Therapeutics therapist providing a focused foot treatment to a client"
            fill
            className="object-cover object-center"
            sizes="(max-width:1024px) 100vw, 50vw"
            priority
          />
        </div>
      </div>

      <section className="mt-20 rounded-3xl border border-[var(--border)] bg-[#fafafa] p-8 lg:p-12">
        <h2 className="font-serif text-3xl text-[var(--text)]">Lead therapist</h2>
        <p className="mt-4 max-w-3xl text-[var(--muted)] leading-relaxed">
          Our lead therapist brings continuing education in traditional Chinese medicine, massage
          therapy, reflexology, and integrative nutrition. Credentials include formal training in
          meridian theory, clinical acupressure, and trauma-informed breathwork. We maintain
          professional memberships with regional holistic health networks and pursue annual
          supervision to keep care ethical and current.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
          <li>Traditional Chinese Medicine & herbal formulation</li>
          <li>Reflexology & therapeutic massage</li>
          <li>Mindfulness-based stress reduction</li>
          <li>Community herbal education & online tutoring</li>
        </ul>
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl text-[var(--text)]">Visit us</h2>
        <p className="mt-3 text-[var(--muted)]">{BRAND.location}</p>
        <Link
          href={BRAND.mapsLink}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-semibold text-[var(--primary)] hover:underline"
        >
          Open in Google Maps →
        </Link>
      </section>
    </div>
  );
}
