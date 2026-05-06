"use client";

import { BRAND } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CartBadge } from "./cart-badge";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/book", label: "Book" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function HeaderNav({
  email,
  isAdmin,
}: {
  email: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
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
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition hover:bg-[#eef7ef] hover:text-[var(--primary)] ${
                pathname === l.href
                  ? "text-[var(--primary)]"
                  : "text-[var(--text)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--secondary)] hover:bg-[#e8eef5]"
            >
              Admin
            </Link>
          )}
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
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[#eef7ef]"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--secondary)] hover:bg-[#e8eef5]"
              >
                Admin
              </Link>
            )}
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
