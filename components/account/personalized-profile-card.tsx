import Link from "next/link";
import { updateMyProfileFromForm } from "@/app/actions/account";
import { BRAND } from "@/lib/constants";

export type PersonalizedProfileCardProps = {
  email: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
  /** Where this card is shown — tweaks accent and copy. */
  variant: "account" | "admin";
};

function accraGreeting(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Accra",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function displayInitials(name: string, email: string): string {
  const n = name.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2 && parts[0][0] && parts[parts.length - 1][0]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase();
}

function firstName(name: string, email: string): string {
  const n = name.trim();
  if (n) return n.split(/\s+/)[0] ?? n;
  const local = email.split("@")[0];
  return local || "there";
}

export function PersonalizedProfileCard({
  email,
  name,
  phone,
  isAdmin,
  createdAt,
  variant,
}: PersonalizedProfileCardProps) {
  const isAdminVariant = variant === "admin";
  const greeting = accraGreeting();
  const first = firstName(name, email);
  const initials = displayInitials(name, email);
  const since = new Date(createdAt).toLocaleDateString("en-GH", {
    month: "long",
    year: "numeric",
  });

  const shell = isAdminVariant
    ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-white to-[#f0f4fa] shadow-md ring-1 ring-emerald-900/5"
    : "border-[var(--border)] bg-white shadow-sm";

  return (
    <section
      className={`rounded-2xl border p-6 sm:p-8 ${shell}`}
      aria-labelledby="profile-heading"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-xl font-bold tracking-tight text-white shadow-inner ${
            isAdminVariant
              ? "bg-gradient-to-br from-emerald-600 to-[#1e3a5f]"
              : "bg-gradient-to-br from-[var(--primary)] to-[#1e3a5f]"
          }`}
          aria-hidden
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--muted)] sm:text-[15px]">
            {greeting},{" "}
            <span className="font-semibold text-[var(--text)]">{first}</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2
              id="profile-heading"
              className="font-serif text-2xl font-semibold tracking-tight text-[var(--text)]"
            >
              {isAdmin ? "Your operations profile" : "Your profile"}
            </h2>
            {isAdmin && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                Administrator
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            {isAdmin ? (
              <>
                This is how your name and phone appear across the console and in client-facing touchpoints
                tied to your login. Time shown in greetings uses{" "}
                <span className="font-medium text-[var(--text)]">Africa/Accra</span>.
              </>
            ) : (
              <>
                Keep your details current so order updates and appointment reminders reach you. Shopping
                as part of {BRAND.name}.
              </>
            )}
          </p>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Email
              </dt>
              <dd className="mt-1 font-mono text-[13px] font-medium text-[var(--text)]">{email}</dd>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Sign-in email is not edited here — contact support if you need it updated.
              </p>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Member since
              </dt>
              <dd className="mt-1 font-medium text-[var(--text)]">{since}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <h3 className="text-sm font-semibold text-[var(--text)]">Edit display name &amp; phone</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {isAdmin
            ? "Used for sidebar, reports context, and any communications that reference this account."
            : "We use your phone for SMS or WhatsApp follow-ups when you opt in at checkout or booking."}{" "}
            {!isAdmin && (
              <>
                You can also reach us on the{" "}
                <Link href="/contact" className="font-semibold text-[var(--primary)] hover:underline">
                  contact
                </Link>{" "}
                page.
              </>
            )}
        </p>

        <form action={updateMyProfileFromForm} className="mt-4 flex max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 flex-1 sm:min-w-[12rem]">
            <label htmlFor="profile-name" className="sr-only">
              Full name
            </label>
            <input
              id="profile-name"
              name="name"
              defaultValue={name}
              placeholder="Full name"
              autoComplete="name"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--primary)]/20 focus:ring-2"
            />
          </div>
          <div className="min-w-0 flex-1 sm:max-w-[14rem]">
            <label htmlFor="profile-phone" className="sr-only">
              Phone
            </label>
            <input
              id="profile-phone"
              name="phone"
              type="tel"
              defaultValue={phone}
              placeholder="+233…"
              autoComplete="tel"
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none ring-[var(--primary)]/20 focus:ring-2"
            />
          </div>
          <button
            type="submit"
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 ${
              isAdminVariant ? "bg-emerald-700 hover:bg-emerald-800" : "bg-[#1e3a5f] hover:bg-[#162d49]"
            }`}
          >
            Save changes
          </button>
        </form>
      </div>
    </section>
  );
}
