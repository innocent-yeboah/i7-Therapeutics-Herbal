"use client";

import { BRAND } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type Form = z.infer<typeof schema>;

function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/admin";
  const errorParam = search.get("error");
  const [err, setErr] = useState<string | null>(
    errorParam === "not_admin"
      ? "This account does not have administrator access."
      : null
  );
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@i7therapeuticsherbal.com" },
  });

  const onSubmit = async (data: Form) => {
    setErr(null);

    const email = data.email.trim().toLowerCase();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (error) {
      setErr(
        error.message.includes("Invalid login") || error.message.includes("invalid")
          ? "Invalid email or password."
          : error.message
      );
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setErr("Sign-in failed. Please try again.");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (!profile?.is_admin) {
      await supabase.auth.signOut();
      setErr("This account is not authorized for the admin console.");
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b1220] via-[#162d49] to-[#0b1220] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-serif text-2xl font-semibold text-white">{BRAND.name}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-400/90">
            Admin console
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-slate-700/50 bg-white p-6 shadow-xl"
        >
          <div>
            <h1 className="font-serif text-2xl text-slate-900">Administrator sign in</h1>
            <p className="mt-1 text-sm text-slate-600">
              Secure access for authorized staff only.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {err && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#1e3a5f] py-3 text-sm font-semibold text-white transition hover:bg-[#162d49] disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in to dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="font-medium text-emerald-400/90 hover:text-emerald-300">
            ← Back to storefront
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0b1220] text-sm text-slate-400">
          Loading admin sign-in…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
