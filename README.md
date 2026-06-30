# Strasshof Site (Next.js)

Public website + admin panel for **ASKÖ Strasshof SV**, built with Next.js and
Supabase. Club-owned content (news, teams, sponsors, shop) lives in the `app`
schema. Match/squad statistics link to the official ÖFB club pages.

## Stack

- Next.js 16 (App Router, React 19)
- Tailwind CSS v4
- Supabase (data + Auth for admin)

## Getting started

```bash
cp .env.local.example .env.local   # Supabase URL + anon key
npm install
npm run dev                        # http://localhost:3000
```

Without Supabase env vars the site renders with empty states.

## Database

Apply migrations to a **dedicated** Supabase project (not shared with Fonteta):

```bash
supabase db push
```

Expose the `app` schema in **Dashboard → Project Settings → API → Exposed schemas**.

## Admin

- `/admin` — Supabase Auth (email/password)
- Manage: news, teams (Mannschaften), sponsors, shop, messages, branding
- Teams can link to ÖFB Kader URLs; fixtures/tables via `/spiele`

## Structure

```
app/
  (site)/     public pages (DE routes: /news, /mannschaften, /spiele, …)
  admin/      admin panel
lib/
  data.ts     app schema reads
  config.ts   club branding + ÖFB URLs
supabase/migrations/
```

## Deploy

Deploy on Vercel with the same env vars. Use a separate Supabase project for
production.
