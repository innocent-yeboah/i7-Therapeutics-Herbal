import { BRAND } from "@/lib/constants";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <div>
          <p className="font-serif text-xl text-[var(--primary)]">{BRAND.name}</p>
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
                <Link className="hover:text-[var(--primary)]" href="/book">
                  Book
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-[var(--text)]">Connect</p>
            <ul className="space-y-1 text-[var(--muted)]">
              <li>
                <a
                  className="hover:text-[var(--primary)]"
                  href={BRAND.instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram @i7_therapeutics_herbal
                </a>
              </li>
              <li>
                <a className="hover:text-[var(--primary)]" href={`mailto:${BRAND.email}`}>
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a className="hover:text-[var(--primary)]" href={`tel:${BRAND.phoneTel}`}>
                  {BRAND.phoneDisplay}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] bg-[#fafafa] py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
