import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import { PersonalizedProfileCard } from "@/components/account/personalized-profile-card";

export const metadata = {
  title: "My account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.is_admin) {
    redirect("/admin");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, total_amount, status, created_at, paystack_reference")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, appointment_date, appointment_time, status, notes, services(name)")
    .eq("user_id", user.id)
    .order("appointment_date", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-[var(--text)]">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10">
        <PersonalizedProfileCard
          variant="account"
          email={user.email ?? ""}
          name={profile?.name ?? ""}
          phone={profile?.phone ?? ""}
          isAdmin={false}
          createdAt={profile?.created_at ?? user.created_at ?? new Date().toISOString()}
        />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-[var(--text)]">Orders</h2>
        <div className="mt-4 space-y-3">
          {(orders ?? []).length === 0 && (
            <p className="text-sm text-[var(--muted)]">No orders yet.</p>
          )}
          {(orders ?? []).map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">GHS {Number(o.total_amount).toFixed(2)}</p>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(o.created_at).toLocaleString()} · {o.status}
                </p>
              </div>
              {o.paystack_reference && (
                <span className="font-mono text-xs text-[var(--muted)]">
                  {o.paystack_reference}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-[var(--text)]">Appointments</h2>
        <div className="mt-4 space-y-3">
          {(appointments ?? []).length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              No appointments yet.{" "}
              <Link href="/book" className="font-semibold text-[var(--primary)]">
                Book one
              </Link>
            </p>
          )}
          {(appointments ?? []).map((a) => {
            const svc = a.services as { name?: string } | null;
            return (
              <div
                key={a.id}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm"
              >
                <p className="font-medium">{svc?.name ?? "Service"}</p>
                <p className="text-xs text-[var(--muted)]">
                  {a.appointment_date} · {a.appointment_time} · {a.status}
                </p>
                {a.notes && (
                  <p className="mt-2 text-xs text-[var(--muted)]">Note: {a.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
