import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/admin";

/** Hash client IP for storage (no raw IP in DB). */
export function hashClientIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Enforces max contact submissions per IP per UTC hour via Supabase RPC.
 * Returns whether the request is allowed (caller should return 429 if false).
 */
export async function checkContactRateLimit(
  ip: string,
  maxPerHour = 5
): Promise<{ allowed: boolean }> {
  const admin = createServiceClient();
  const { data, error } = await admin.rpc("check_contact_rate_limit", {
    p_ip_hash: hashClientIp(ip),
    p_max: maxPerHour,
  });

  if (error) {
    console.warn("check_contact_rate_limit skipped (migration or DB):", error.message);
    return { allowed: true };
  }

  return { allowed: data === true };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
