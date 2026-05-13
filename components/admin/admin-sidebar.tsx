"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/constants";

const groups: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Command",
    items: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/profile", label: "My profile" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/appointments", label: "Appointments" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/inventory", label: "Inventory" },
    ],
  },
  {
    title: "Relationships",
    items: [
      { href: "/admin/customers", label: "Customers" },
      { href: "/admin/contacts", label: "Inbox & leads" },
      { href: "/admin/follow-up", label: "Follow-up" },
    ],
  },
  {
    title: "Intelligence",
    items: [{ href: "/admin/reports", label: "Reports & analytics" }],
  },
  {
    title: "System",
    items: [{ href: "/admin/webhook-failures", label: "Payments & webhooks" }],
  },
];

function NavIcon({ href }: { href: string }) {
  const stroke = "currentColor";
  const className = "h-5 w-5 shrink-0 opacity-80";
  switch (href) {
    case "/admin":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75A2.25 2.25 0 0 1 15.75 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H15.75A2.25 2.25 0 0 1 13.5 18v-2.25Zm0-9A2.25 2.25 0 0 1 15.75 4.5h2.25a2.25 2.25 0 0 1 2.25 2.25V9a2.25 2.25 0 0 1-2.25 2.25H15.75A2.25 2.25 0 0 1 13.5 9V6.75Z" />
        </svg>
      );
    case "/admin/profile":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A18.966 18.966 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      );
    case "/admin/appointments":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
        </svg>
      );
    case "/admin/orders":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
      );
    case "/admin/inventory":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
      );
    case "/admin/customers":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      );
    case "/admin/contacts":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      );
    case "/admin/follow-up":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      );
    case "/admin/reports":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
        </svg>
      );
    case "/admin/webhook-failures":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={stroke}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.612l-4.657 4.657a4.5 4.5 0 0 1-6.364-6.364l1.03-1.03m9.514-9.514 1.03-1.03m-9.514 9.514h.008v.008m0-12.012v.008" />
        </svg>
      );
    default:
      return <span className="h-5 w-5 shrink-0 rounded bg-white/10" />;
  }
}

export function AdminSidebar({
  userEmail,
  displayName,
}: {
  userEmail: string;
  displayName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-full flex-col border-r border-slate-800/80 bg-[#0b1220] text-slate-200 lg:w-64 lg:min-h-0 lg:shrink-0">
      <div className="border-b border-slate-800/80 px-5 py-6">
        <p className="font-serif text-lg font-semibold tracking-tight text-white">{BRAND.name}</p>
        <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-emerald-400/90">
          Operations
        </p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {g.title}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-emerald-600/20 text-white ring-1 ring-emerald-500/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <NavIcon href={item.href} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        <p className="truncate text-xs text-slate-500">Signed in</p>
        {displayName ? (
          <p className="truncate text-sm font-semibold text-white">{displayName}</p>
        ) : null}
        <p className={`truncate text-sm text-slate-300 ${displayName ? "mt-0.5 text-xs text-slate-500" : "font-medium"}`}>
          {userEmail}
        </p>
        <Link
          href="/"
          className="mt-3 block text-center text-xs font-semibold text-emerald-400/90 hover:text-emerald-300"
        >
          ← Storefront
        </Link>
        <Link
          href="/account"
          className="mt-2 block text-center text-xs text-slate-500 hover:text-slate-300"
        >
          My profile
        </Link>
      </div>
    </aside>
  );
}
