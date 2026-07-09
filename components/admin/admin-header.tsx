"use client";

import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export function AdminHeader({
  title,
  subtitle,
  displayName,
  userEmail,
}: {
  title: string;
  subtitle?: string;
  displayName: string;
  userEmail: string;
}) {
  const initials = (displayName || userEmail).slice(0, 2).toUpperCase();

  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-slate-200/90 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700/90">
          Admin console
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm text-slate-600">{subtitle}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/notifications"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          aria-label="Notifications"
          title="Send notifications"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
        </Link>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
            {initials}
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold text-slate-900">
              {displayName || "Administrator"}
            </p>
            <p className="truncate text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>

        <SignOutButton className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" />
      </div>
    </header>
  );
}
