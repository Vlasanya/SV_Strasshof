/**
 * Apply a SQL migration file to the remote Supabase database.
 *
 * Usage:
 *   npm run db:migrate -- club_event
 *   npm run db:migrate -- join_inquiry
 *
 * Requires SUPABASE_DB_PASSWORD or DATABASE_URL in .env.local
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const MIGRATIONS = {
  join_inquiry: {
    file: "supabase/migrations/20260630120000_join_inquiry.sql",
    table: "app.join_inquiry",
  },
  club_event: {
    file: "supabase/migrations/20260630140000_club_event.sql",
    table: "app.club_event",
  },
  club_event_external: {
    file: "supabase/migrations/20260630160000_club_event_external.sql",
    table: "app.club_event",
  },
  club_event_field: {
    file: "supabase/migrations/20260630170000_club_event_field.sql",
    table: "app.club_event",
  },
  club_event_match: {
    file: "supabase/migrations/20260630180000_club_event_match_type.sql",
    table: "app.club_event",
  },
};

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

const key = process.argv[2]?.trim();
const migration = key ? MIGRATIONS[key] : null;
if (!migration) {
  console.error(
    `Usage: npm run db:migrate -- <${Object.keys(MIGRATIONS).join("|")}>`,
  );
  process.exit(1);
}

const sql = readFileSync(resolve(root, migration.file), "utf8");

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

Add to .env.local:
  SUPABASE_DB_PASSWORD=...   (Supabase → Settings → Database)
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
    `select to_regclass($1) as tbl`,
    [migration.table],
  );
  if (!check.rows[0]?.tbl) {
    throw new Error(`Table ${migration.table} was not created.`);
  }
  console.log(`OK — ${migration.table} is ready.`);
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
