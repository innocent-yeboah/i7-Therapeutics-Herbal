"use client";

import { BRAND } from "@/lib/constants";
import { HEALING_SERVICES, COMING_SOON_OFFERINGS } from "@/lib/services";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CartBadge } from "./cart-badge";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/book", label: "Book" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isServicesActive =
    pathname === "/services" || pathname.startsWith("/services/");

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex flex-col">
          <span className="font-serif text-lg font-semibold text-[var(--primary)] transition group-hover:text-[var(--secondary)] sm:text-xl">
            {BRAND.name}
          </span>
          <span className="hidden text-xs text-[var(--muted)] sm:block">
            {BRAND.tagline}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={`rounded-full px-3 py-2 text-sm font-medium transition hover:bg-[#eef7ef] hover:text-[var(--primary)] ${
              pathname === "/" ? "text-[var(--primary)]" : "text-[var(--text)]"
            }`}
          >
            Home
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setServicesOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-[#eef7ef] hover:text-[var(--primary)] ${
                isServicesActive ? "text-[var(--primary)]" : "text-[var(--text)]"
              }`}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
            >
              Services
              <svg
                className={`h-4 w-4 transition ${servicesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {servicesOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl">
                <div className="max-h-80 overflow-y-auto py-2">
                  <Link
                    href="/services"
                    onClick={() => setServicesOpen(false)}
                    className="block px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[#eef7ef]"
                  >
                    All services
                  </Link>
                  <div className="my-1 border-t border-[var(--border)]" />
                  {HEALING_SERVICES.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/${s.slug}`}
                      onClick={() => setServicesOpen(false)}
                      className="block px-4 py-2 text-sm text-[var(--text)] hover:bg-[#eef7ef] hover:text-[var(--primary)]"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-[var(--border)] bg-[#fafafa] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Coming soon
                  </p>
                  {COMING_SOON_OFFERINGS.map((o) => (
                    <Link
                      key={o.slug}
                      href="/shop"
                      onClick={() => setServicesOpen(false)}
                      className="mt-1 block text-sm text-[var(--muted)] hover:text-[var(--secondary)]"
                    >
                      {o.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {mainLinks.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition hover:bg-[#eef7ef] hover:text-[var(--primary)] ${
                pathname === l.href ? "text-[var(--primary)]" : "text-[var(--text)]"
              }`}
            >
              {l.label}
            </Link>
          ))}

        </nav>

        <div className="flex items-center gap-2">
          <CartBadge />
          <Link
            href={email ? "/account" : "/account/login"}
            className="hidden rounded-full border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)] sm:inline-block"
          >
            {email ? "Account" : "Sign in"}
          </Link>
          <button
            type="button"
            className="inline-flex rounded-md border border-[var(--border)] p-2 md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[#eef7ef]"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => setMobileServicesOpen((o) => !o)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#eef7ef] ${
                isServicesActive ? "text-[var(--primary)]" : "text-[var(--text)]"
              }`}
            >
              Services
              <svg
                className={`h-4 w-4 transition ${mobileServicesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileServicesOpen && (
              <div className="ml-3 flex flex-col gap-0.5 border-l-2 border-[var(--border)] pl-3">
                <Link
                  href="/services"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--primary)] hover:bg-[#eef7ef]"
                >
                  All services
                </Link>
                {HEALING_SERVICES.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[#eef7ef]"
                  >
                    {s.name}
                  </Link>
                ))}
                <p className="mt-2 px-3 text-xs font-semibold uppercase text-[var(--muted)]">
                  Coming soon
                </p>
                {COMING_SOON_OFFERINGS.map((o) => (
                  <Link
                    key={o.slug}
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[#eef7ef]"
                  >
                    {o.name}
                  </Link>
                ))}
              </div>
            )}

            {mainLinks.slice(1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[#eef7ef]"
              >
                {l.label}
              </Link>
            ))}

            <Link
              href={email ? "/account" : "/account/login"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#f5f5f5]"
            >
              {email ? "My account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
