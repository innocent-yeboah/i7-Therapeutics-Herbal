import { BRAND } from "@/lib/constants";

/**
 * Resend "From" address. Prefer env in each environment; fall back to verified domain sender.
 */
export function getResendFromAddress(): string {
  const env = process.env.RESEND_FROM_EMAIL?.trim();
  if (env) return env;
  return BRAND.emailFrom;
}
