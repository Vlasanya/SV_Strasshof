/**
 * Seed weekly training sessions for all teams into app.club_event.
 *
 * Usage:
 *   npm run db:seed-trainings
 *   npm run db:seed-trainings -- --force   # replace existing seeded trainings
 *
 * Requires SUPABASE_DB_PASSWORD or DATABASE_URL in .env.local
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const TEAM_TRAINING_SCHEDULES = {
  KM: {
    slots: [
      { weekday: 2, start: "19:00", end: "20:30", field: "platz-1" },
      { weekday: 4, start: "19:00", end: "20:30", field: "platz-1" },
      { weekday: 6, start: "10:00", end: "11:30", field: "platz-1" },
    ],
  },
  Res: {
    slots: [
      { weekday: 2, start: "18:00", end: "19:30", field: "platz-2" },
      { weekday: 4, start: "18:00", end: "19:30", field: "platz-2" },
      { weekday: 7, start: "09:00", end: "10:30", field: "platz-2" },
    ],
  },
  U15: {
    slots: [
      { weekday: 1, start: "17:30", end: "19:00", field: "kunstrasen" },
      { weekday: 3, start: "17:30", end: "19:00", field: "kunstrasen" },
      { weekday: 5, start: "17:00", end: "18:30", field: "kunstrasen" },
    ],
  },
  "U14-A": {
    slots: [
      { weekday: 2, start: "17:00", end: "18:30", field: "platz-2" },
      { weekday: 4, start: "17:00", end: "18:30", field: "platz-2" },
    ],
  },
  "U14-B": {
    slots: [
      { weekday: 1, start: "17:00", end: "18:30", field: "platz-1" },
      { weekday: 3, start: "17:00", end: "18:30", field: "platz-1" },
    ],
  },
  "U12-B": {
    slots: [
      { weekday: 2, start: "16:30", end: "18:00", field: "kunstrasen" },
      { weekday: 4, start: "16:30", end: "18:00", field: "kunstrasen" },
    ],
  },
  U11: {
    slots: [
      { weekday: 3, start: "16:00", end: "17:30", field: "platz-2" },
      { weekday: 5, start: "16:00", end: "17:30", field: "platz-2" },
    ],
  },
  U10: {
    slots: [
      { weekday: 2, start: "16:00", end: "17:15", field: "kunstrasen" },
      { weekday: 4, start: "16:00", end: "17:15", field: "kunstrasen" },
    ],
  },
  "U09-A": {
    slots: [
      { weekday: 1, start: "16:00", end: "17:15", field: "platz-1" },
      { weekday: 3, start: "16:00", end: "17:15", field: "platz-1" },
    ],
  },
  "U09-B": {
    slots: [
      { weekday: 2, start: "15:30", end: "16:45", field: "halle" },
      { weekday: 4, start: "15:30", end: "16:45", field: "halle" },
    ],
  },
};

const SEED_DESCRIPTION =
  "Standard-Trainingsplan (Vorlage — in der Admin bearbeitbar).";
const LOCATION = "Sportplatz Strasshof";
const WEEKS_AHEAD = 12;

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

function connectionString() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !url) return null;
  const ref = new URL(url).hostname.split(".")[0];
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

/** Monday 00:00 of the week containing `date` (local). */
function startOfIsoWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

loadEnvLocal();

const force = process.argv.includes("--force");
const conn = connectionString();
if (!conn) {
  console.error("Missing SUPABASE_DB_PASSWORD or DATABASE_URL in .env.local");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const existing = await client.query(
    `select count(*)::int as n from app.club_event where description = $1`,
    [SEED_DESCRIPTION],
  );
  const count = existing.rows[0]?.n ?? 0;
  if (count > 0 && !force) {
    console.log(
      `Already ${count} seeded training(s). Run with --force to replace.`,
    );
    process.exit(0);
  }

  const { rows: teams } = await client.query(
    `select id, slug, name from app.team order by sort_order, name`,
  );
  if (teams.length === 0) {
    console.error("No teams found. Run supabase/seed/strasshof_teams.sql first.");
    process.exit(1);
  }

  const weekStart = startOfIsoWeek(new Date());
  const events = [];

  for (const team of teams) {
    const schedule = TEAM_TRAINING_SCHEDULES[team.slug];
    if (!schedule) {
      console.warn(`No schedule for team slug "${team.slug}" — skipped.`);
      continue;
    }

    for (let w = 0; w < WEEKS_AHEAD; w++) {
      const base = addDays(weekStart, w * 7);
      for (const slot of schedule.slots) {
        const day = addDays(base, slot.weekday - 1);
        const dateStr = formatDateYmd(day);
        events.push({
          title: `Training ${team.name}`,
          team_id: team.id,
          field: slot.field,
          dateStr,
          start: slot.start,
          end: slot.end,
        });
      }
    }
  }

  await client.query("begin");

  if (count > 0) {
    await client.query(`delete from app.club_event where description = $1`, [
      SEED_DESCRIPTION,
    ]);
  }

  let inserted = 0;
  for (const ev of events) {
    await client.query(
      `
      insert into app.club_event (
        title, event_type, team_id, description, location, field,
        starts_at, ends_at, all_day, published
      ) values (
        $1, 'training', $2, $3, $4, $5,
        ($6::date + $7::time) at time zone 'Europe/Vienna',
        ($6::date + $8::time) at time zone 'Europe/Vienna',
        false, true
      )
      `,
      [
        ev.title,
        ev.team_id,
        SEED_DESCRIPTION,
        LOCATION,
        ev.field,
        ev.dateStr,
        ev.start,
        ev.end,
      ],
    );
    inserted++;
  }

  await client.query("commit");

  const byTeam = new Map();
  for (const team of teams) {
    const schedule = TEAM_TRAINING_SCHEDULES[team.slug];
    if (schedule) {
      byTeam.set(team.name, schedule.slots.length);
    }
  }

  console.log(`OK — ${inserted} training sessions for ${byTeam.size} teams.`);
  console.log(`Period: ${WEEKS_AHEAD} weeks from ${formatDateYmd(weekStart)}`);
  for (const [name, slots] of byTeam) {
    console.log(`  · ${name}: ${slots}×/Woche`);
  }
  console.log("\nBearbeiten unter /admin/termine");
} catch (err) {
  await client.query("rollback").catch(() => {});
  console.error("Failed:", err.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
