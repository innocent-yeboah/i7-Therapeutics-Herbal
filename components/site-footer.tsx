import { BRAND } from "@/lib/constants";
import { HealingBrand } from "@/components/healing-brand";
import Link from "next/link";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div>
          <Link
            href="/"
            aria-label="i7 Therapeutics Herbal home"
            className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
          >
            <HealingBrand />
          </Link>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            {BRAND.tagline}. Visit us at {BRAND.location}.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-[var(--text)]">Explore</p>
            <ul className="space-y-1 text-[var(--muted)]">
              <li>
                <Link className="hover:text-[var(--primary)]" href="/services">
                  Services
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--primary)]" href="/shop">
                  Shop
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--primary)]" href="/shop">
                  Coming soon
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--primary)]" href="/consultation">
                  Book consultation
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-[var(--text)]">Connect</p>
            <ul className="flex flex-wrap items-center gap-3 text-[var(--muted)]">
              <li>
                <a
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title={`Instagram ${BRAND.instagramLabel}`}
                  aria-label={`Instagram ${BRAND.instagramLabel}`}
                  className="inline-flex rounded-full border border-transparent p-2 text-[var(--text)] transition hover:border-[var(--border)] hover:bg-[#fafafa] hover:text-[var(--primary)]"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  title={BRAND.email}
                  aria-label={`Email ${BRAND.email}`}
                  className="inline-flex rounded-full border border-transparent p-2 text-[var(--text)] transition hover:border-[var(--border)] hover:bg-[#fafafa] hover:text-[var(--primary)]"
                >
                  <MailIcon className="h-5 w-5" />
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.phoneTel}`}
                  title={BRAND.phoneDisplay}
                  aria-label={`Phone ${BRAND.phoneDisplay}`}
                  className="inline-flex rounded-full border border-transparent p-2 text-[var(--text)] transition hover:border-[var(--border)] hover:bg-[#fafafa] hover:text-[var(--primary)]"
                >
                  <PhoneIcon className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] bg-[#fafafa] px-4 py-4 text-center text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        <p className="mt-2">
          <a
            href={BRAND.siteCredit.href}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--muted)] underline decoration-[var(--border)] underline-offset-2 transition hover:text-[var(--secondary)]"
          >
            {BRAND.siteCredit.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
