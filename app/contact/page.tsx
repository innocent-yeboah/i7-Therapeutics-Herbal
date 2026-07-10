import { BRAND } from "@/lib/constants";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const wa =
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || BRAND.whatsappDigits;
  const waLink = `https://wa.me/${wa.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello ${BRAND.name}, I would love to know more about your services.`
  )}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl text-[var(--text)]">Contact</h1>
          <p className="mt-3 text-[var(--muted)]">
            Reach out for service inquiries, booking support, or partnership opportunities. Our team
            will respond promptly to assist you.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li>
              <span className="font-semibold text-[var(--text)]">Email</span>
              <br />
              <a className="text-[var(--primary)] hover:underline" href={`mailto:${BRAND.email}`}>
                {BRAND.email}
              </a>
            </li>
            <li>
              <span className="font-semibold text-[var(--text)]">Phone</span>
              <br />
              <a className="text-[var(--primary)] hover:underline" href={`tel:${BRAND.phoneTel}`}>
                {BRAND.phoneDisplay}
              </a>
            </li>
            <li>
              <span className="font-semibold text-[var(--text)]">Studio</span>
              <br />
              <span className="text-[var(--muted)]">{BRAND.location}</span>
            </li>
          </ul>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow transition hover:brightness-110"
          >
            Chat on WhatsApp
          </a>
        </div>
        <div className="space-y-8">
          <ContactForm />
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
            <iframe
              title="Map"
              src={BRAND.mapsEmbedUrl}
              width="100%"
              height="320"
              loading="lazy"
              style={{ border: 0 }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
