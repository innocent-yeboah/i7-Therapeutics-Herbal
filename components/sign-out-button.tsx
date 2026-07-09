"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();
  return (
    <button
      type="button"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className={
        className ??
        "rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--primary)]"
      }
    >
      Sign out
    </button>
  );
}
