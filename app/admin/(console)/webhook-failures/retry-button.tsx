"use client";

import { retryPaystackWebhookFailure } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RetryWebhookButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setMessage(null);
          setPending(true);
          try {
            const r = await retryPaystackWebhookFailure(id);
            if (!r.ok) {
              setMessage(r.error);
            } else {
              router.refresh();
            }
          } finally {
            setPending(false);
          }
        }}
        className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--primary)] hover:bg-[#f4f9f7] disabled:opacity-50"
      >
        {pending ? "Retrying…" : "Retry fulfillment"}
      </button>
      {message && <p className="max-w-[200px] text-right text-[10px] text-red-600">{message}</p>}
    </div>
  );
}
