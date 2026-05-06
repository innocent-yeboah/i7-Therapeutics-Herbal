"use client";

import { BRAND } from "@/lib/constants";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  message: z.string().min(10, "Please share a bit more detail"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setStatus("idle");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setStatus("err");
      return;
    }
    setStatus("ok");
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
    >
      <h2 className="font-serif text-2xl text-[var(--text)]">Send a message</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--text)]" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text)]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text)]" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
            {...register("message")}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
          )}
        </div>
      </div>
      {status === "ok" && (
        <p className="mt-4 text-sm text-[var(--primary)]">
          Thank you — we will reply soon at {BRAND.email}.
        </p>
      )}
      {status === "err" && (
        <p className="mt-4 text-sm text-red-600">
          Something went wrong. You can also email us directly.
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-full bg-[var(--secondary)] py-3 text-sm font-semibold text-white hover:bg-[#162d49] disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
