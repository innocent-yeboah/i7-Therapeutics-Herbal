"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export function WaitlistForm({
  offeringSlug,
  offeringName,
  compact = false,
}: {
  offeringSlug: string;
  offeringName: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "ok" | "warn" | "err">("idle");
  const [banner, setBanner] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setStatus("idle");
    setBanner(null);

    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        offeringSlug,
        offeringName,
      }),
    });

    type ApiResponse = { ok?: boolean; warning?: string; error?: string };
    let json: ApiResponse | null = null;
    try {
      json = (await res.json()) as ApiResponse;
    } catch {
      json = null;
    }

    if (res.status === 429) {
      setStatus("err");
      setBanner(json?.error ?? "Too many requests. Please try again later.");
      return;
    }

    if (!res.ok || !json?.ok) {
      setStatus("err");
      setBanner(json?.error ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("ok");
    setBanner(
      json.warning ??
        `You're on the list! We'll notify you when ${offeringName} launches.`
    );
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={compact ? "mt-4" : "mt-6"}>
      <div className={`flex ${compact ? "flex-col gap-2" : "flex-col gap-3 sm:flex-row"}`}>
        <div className="flex-1">
          <label htmlFor={`waitlist-${offeringSlug}`} className="sr-only">
            Email for {offeringName} waitlist
          </label>
          <input
            id={`waitlist-${offeringSlug}`}
            type="email"
            placeholder="your@email.com"
            className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`shrink-0 rounded-full bg-[var(--secondary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#162d49] disabled:opacity-60 ${
            compact ? "w-full" : "sm:w-auto"
          }`}
        >
          {isSubmitting ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {banner && status === "ok" && (
        <p className="mt-3 text-sm text-[var(--primary)]">{banner}</p>
      )}
      {banner && status === "warn" && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {banner}
        </p>
      )}
      {banner && status === "err" && (
        <p className="mt-3 text-sm text-red-600">{banner}</p>
      )}
    </form>
  );
}
