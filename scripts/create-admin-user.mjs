/**
 * Create an admin user in Supabase Auth.
 *
 * Usage:
 *   node scripts/create-admin-user.mjs email@example.com 'password'
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (or the environment). Get the service role key from:
 * Supabase Dashboard → Project Settings → API → Secret keys
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const path = resolve(root, ".env.local");
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local optional if vars are exported in the shell
  }
}

loadEnvLocal();

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
