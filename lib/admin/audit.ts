import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function logAdminAction(input: {
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const h = await headers();
    const supabase = await createClient();
    await supabase.from("admin_audit_log").insert({
      admin_id: input.adminId,
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      details: input.details ?? null,
      ip_address: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip"),
      user_agent: h.get("user-agent"),
    });
  } catch (e) {
    console.error("[audit] failed to log action", e);
  }
}
