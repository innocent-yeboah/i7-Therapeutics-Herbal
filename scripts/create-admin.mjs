/**
 * Create or reset an admin Auth user and set public.users.is_admin (requires service role).
 * If the email already exists, updates password and confirms email (idempotent).
 *
 * Usage: npm run create-admin -- you@example.com YourSecurePassword
 *
 * Requires in .env.local (or environment):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const emailArg = process.argv[2];
const passwordArg = process.argv[3];

const email = (emailArg || process.env.BOOTSTRAP_ADMIN_EMAIL || "").trim();
const password = (passwordArg || process.env.BOOTSTRAP_ADMIN_PASSWORD || "").trim();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!email || !password) {
  console.error("Usage: npm run create-admin -- <email> <password>");
  console.error("Or set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const displayName =
  process.env.BOOTSTRAP_ADMIN_NAME?.trim() || email.split("@")[0] || "Administrator";

async function findAuthUserIdByEmail(emailNorm) {
  const target = emailNorm.toLowerCase();
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => (x.email || "").toLowerCase() === target);
    if (u?.id) return u.id;
    if (data.users.length < 200) break;
  }
  return null;
}

let userId = null;

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: displayName },
});

if (createErr) {
  const retry =
    /already|exist|registered|duplicate/i.test(createErr.message || "") ||
    createErr.status === 422;
  if (!retry) {
    console.error("Supabase Auth error:", createErr.message);
    process.exit(1);
  }
  const existingId = await findAuthUserIdByEmail(email);
  if (!existingId) {
    console.error("User may exist but could not be found for update:", createErr.message);
    process.exit(1);
  }
  const { error: updErr } = await admin.auth.admin.updateUserById(existingId, {
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (updErr) {
    console.error("Could not reset password for existing user:", updErr.message);
    process.exit(1);
  }
  userId = existingId;
  console.log("Existing user updated (password reset, email confirmed).");
} else {
  userId = created?.user?.id;
}

if (!userId) {
  console.error("No user id returned.");
  process.exit(1);
}

const { error: upErr } = await admin
  .from("users")
  .update({ is_admin: true, name: displayName })
  .eq("id", userId);

if (upErr) {
  console.error("Could not set is_admin on public.users:", upErr.message);
  console.error("Auth user id:", userId);
  process.exit(1);
}

console.log("Admin account ready.");
console.log("  Email:", email);
console.log("  Sign in at /account/login then open /admin");
