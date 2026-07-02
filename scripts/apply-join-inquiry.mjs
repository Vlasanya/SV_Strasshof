/**
 * Create app.join_inquiry in the remote Supabase database.
 *
 * 1. Supabase Dashboard → Project Settings → Database → Database password
 * 2. Add to .env.local:  SUPABASE_DB_PASSWORD=your-password
 * 3. Run:  npm run db:join-inquiry
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  try {
    const text = readFileSync(resolve(root, ".env.local"), "utf8");
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
    // optional
  }
}

loadEnvLocal();

const sql = readFileSync(
  resolve(root, "supabase/migrations/20260630120000_join_inquiry.sql"),
  "utf8",
);

function connectionString() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !url) return null;

  const ref = new URL(url).hostname.split(".")[0];
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

const conn = connectionString();
if (!conn) {
  console.error(`
Missing database credentials.

Add ONE of these to .env.local:

  SUPABASE_DB_PASSWORD=...     (from Supabase → Settings → Database)
  DATABASE_URL=postgresql://... (full connection string from same page)

Then run:  npm run db:join-inquiry
`);
  process.exit(1);
}

const client = new pg.Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const check = await client.query(
    "select to_regclass('app.join_inquiry') as tbl",
  );
  if (!check.rows[0]?.tbl) {
    throw new Error("Table app.join_inquiry was not created.");
  }
  console.log("OK — app.join_inquiry is ready.");
  console.log("Reload /beitritt and submit a test inquiry.");
} catch (err) {
  console.error("Failed:", err.message);
  if (err.message?.includes("password authentication")) {
    console.error(
      "\nWrong database password. Reset it in Supabase → Settings → Database.",
    );
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
