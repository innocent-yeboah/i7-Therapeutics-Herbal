import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Book",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams?: { service?: string };
}) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("name");

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-3xl text-[var(--text)]">Sign in to book</h1>
        <p className="mt-3 text-[var(--muted)]">
          Create an account or sign in to request an appointment and track your visit history.
        </p>
        <Link
          href={`/account/login?next=${encodeURIComponent("/book")}`}
          className="mt-8 inline-block rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  if (!services?.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p>Services are not configured yet. Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl text-[var(--text)]">Book a session</h1>
        <p className="mt-3 text-[var(--muted)]">
          Choose your service, select a quiet day, and pick a time that fits. We will confirm by
          email or WhatsApp.
        </p>
      </header>
      <div className="mt-12">
        <BookingForm
          services={services}
          preselectedServiceId={searchParams?.service}
        />
      </div>
    </div>
  );
}
