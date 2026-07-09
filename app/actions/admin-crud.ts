"use server";

import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/admin/audit";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function upsertServiceFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price"));
  const duration_minutes = Number(formData.get("duration_minutes"));
  const image = String(formData.get("image") || "").trim() || null;
  const slug = String(formData.get("slug") || "").trim() || slugify(name);
  const is_active = formData.get("is_active") === "on";

  if (!name || Number.isNaN(price) || Number.isNaN(duration_minutes)) return;

  const payload = {
    name,
    description,
    price,
    duration_minutes,
    image,
    slug,
    is_active,
  };

  if (id) {
    await supabase.from("services").update(payload).eq("id", id);
    await logAdminAction({
      adminId: user.id,
      action: "service.update",
      targetType: "service",
      targetId: id,
      details: { name },
    });
  } else {
    const { data } = await supabase.from("services").insert(payload).select("id").single();
    await logAdminAction({
      adminId: user.id,
      action: "service.create",
      targetType: "service",
      targetId: data?.id,
      details: { name },
    });
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
  revalidatePath("/admin");
}

export async function deleteServiceFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  if (!id) return;

  await supabase.from("services").delete().eq("id", id);
  await logAdminAction({
    adminId: user.id,
    action: "service.delete",
    targetType: "service",
    targetId: id,
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/book");
}

export async function toggleServiceActiveFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const is_active = formData.get("is_active") === "true";
  if (!id) return;

  await supabase.from("services").update({ is_active }).eq("id", id);
  await logAdminAction({
    adminId: user.id,
    action: "service.toggle_active",
    targetType: "service",
    targetId: id,
    details: { is_active },
  });

  revalidatePath("/admin/services");
  revalidatePath("/services");
}

export async function upsertProductFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price"));
  const stock_quantity = Number(formData.get("stock_quantity"));
  const image = String(formData.get("image") || "").trim() || null;
  const is_active = formData.get("is_active") === "on";

  if (!name || Number.isNaN(price) || Number.isNaN(stock_quantity)) return;

  const payload = { name, description, price, stock_quantity, image, is_active };

  if (id) {
    await supabase.from("products").update(payload).eq("id", id);
    await logAdminAction({
      adminId: user.id,
      action: "product.update",
      targetType: "product",
      targetId: id,
      details: { name },
    });
  } else {
    const { data } = await supabase.from("products").insert(payload).select("id").single();
    await logAdminAction({
      adminId: user.id,
      action: "product.create",
      targetType: "product",
      targetId: data?.id,
      details: { name },
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/admin");
}

export async function deleteProductFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  if (!id) return;

  await supabase.from("products").delete().eq("id", id);
  await logAdminAction({
    adminId: user.id,
    action: "product.delete",
    targetType: "product",
    targetId: id,
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function setTestimonialApprovedFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const approved = formData.get("approved") === "true";
  if (!id) return;

  await supabase.from("testimonials").update({ approved }).eq("id", id);
  await logAdminAction({
    adminId: user.id,
    action: "testimonial.moderate",
    targetType: "testimonial",
    targetId: id,
    details: { approved },
  });

  revalidatePath("/admin/content");
  revalidatePath("/");
}

export async function saveSiteContentFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const key = String(formData.get("key") || "").trim();
  const about = String(formData.get("about") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  if (!key) return;

  await supabase.from("site_content").upsert({
    key,
    value: { about, tagline },
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });

  await logAdminAction({
    adminId: user.id,
    action: "content.update",
    targetType: "site_content",
    targetId: key,
  });

  revalidatePath("/admin/content");
  revalidatePath("/about");
}

export async function sendBulkNotificationFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const channel = String(formData.get("channel") || "") as "email" | "whatsapp";
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const audience = String(formData.get("audience") || "all");

  if (!message || !["email", "whatsapp"].includes(channel)) return;

  const { data: clients } = await supabase
    .from("users")
    .select("id, email, name, phone")
    .eq("is_admin", false);

  const targets = (clients ?? []).filter((c) => c.email);
  let recipientCount = 0;

  if (channel === "email" && process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const { getResendFromAddress } = await import("@/lib/email/from");
    const { clientFollowUpEmail } = await import("@/lib/email/templates");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = getResendFromAddress();
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

    for (const client of targets.slice(0, audience === "all" ? 500 : 50)) {
      if (!client.email) continue;
      const styled = clientFollowUpEmail({ message, siteUrl });
      await resend.emails.send({
        from,
        to: client.email,
        subject: subject || styled.subject,
        html: styled.html,
        text: styled.text,
      });
      recipientCount++;
    }
  }

  await supabase.from("notification_log").insert({
    admin_id: user.id,
    channel,
    audience,
    subject: subject || null,
    message,
    recipient_count: channel === "whatsapp" ? targets.length : recipientCount,
  });

  await logAdminAction({
    adminId: user.id,
    action: "notification.send",
    targetType: "notification",
    details: { channel, audience, recipientCount },
  });

  revalidatePath("/admin/notifications");
}

export async function setAdminRoleFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const userId = String(formData.get("user_id") || "").trim();
  const is_admin = formData.get("is_admin") === "true";
  if (!userId || userId === user.id) return;

  await supabase.from("users").update({ is_admin }).eq("id", userId);
  await logAdminAction({
    adminId: user.id,
    action: "user.set_admin",
    targetType: "user",
    targetId: userId,
    details: { is_admin },
  });

  revalidatePath("/admin/settings");
}

export async function updateContactStatusFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const id = String(formData.get("id") || "").trim();
  const status = String(formData.get("status") || "").trim();
  if (!id || !status) return;

  await supabase.from("contacts").update({ status }).eq("id", id);
  await logAdminAction({
    adminId: user.id,
    action: "contact.update_status",
    targetType: "contact",
    targetId: id,
    details: { status },
  });

  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
}

export async function saveSiteSettingsFromForm(formData: FormData): Promise<void> {
  const { user, supabase } = await requireAdmin();
  const key = String(formData.get("key") || "").trim();
  if (!key) return;

  const value: Record<string, unknown> = {};
  for (const [field, raw] of formData.entries()) {
    if (field === "key") continue;
    const v = String(raw).trim();
    if (v === "true" || v === "false") {
      value[field] = v === "true";
    } else if (v !== "" && !Number.isNaN(Number(v)) && field !== "businessName") {
      value[field] = Number(v);
    } else {
      value[field] = v;
    }
  }

  await supabase.from("site_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  });

  await logAdminAction({
    adminId: user.id,
    action: "settings.update",
    targetType: "site_settings",
    targetId: key,
    details: value,
  });

  revalidatePath("/admin/settings");
}
