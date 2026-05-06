"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email(),
    phone: z.string().min(8, "A reachable phone number helps us confirm bookings"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setErr(null);
    setInfo(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: {
          full_name: data.name,
          phone: data.phone,
        },
      },
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setInfo(
      "Check your email to confirm your address. Once confirmed you can sign in and book sessions."
    );
    router.refresh();
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-serif text-3xl text-[var(--text)]">Create your account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          We collect your name, email, and phone at signup so reminders and receipts reach you.
        </p>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
      >
        <div>
          <label className="text-xs font-medium" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium" htmlFor="phone">
            Phone / WhatsApp
          </label>
          <input
            id="phone"
            autoComplete="tel"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            {...register("confirm")}
          />
          {errors.confirm && (
            <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>
          )}
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {info && <p className="text-sm text-[var(--primary)]">{info}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-[var(--primary)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="text-center text-sm text-[var(--muted)]">
        Already registered?{" "}
        <Link href="/account/login" className="font-semibold text-[var(--primary)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
