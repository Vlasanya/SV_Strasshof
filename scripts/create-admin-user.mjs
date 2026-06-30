/**
 * Create an admin user in Supabase Auth.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-admin-user.mjs email@example.com 'password'
 *
 * Get the service role key from:
 * Supabase Dashboard → Project Settings → API → service_role (secret)
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.argv[2]?.trim();
const password = process.argv[3];

if (!url || !serviceRole) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then retry.",
  );
  process.exit(1);
}

if (!email || !password) {
  console.error(
    "Usage: node scripts/create-admin-user.mjs <email> <password>",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed:", error.message);
  process.exit(1);
}

console.log("User created:", data.user?.id, data.user?.email);
