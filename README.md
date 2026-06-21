# Adengappa Boys Finance Portal

Responsive Sandha, donation, expense, member, pending-balance, and annual-report management built with Next.js 15, TypeScript, Tailwind CSS, Supabase, Recharts, and TanStack Table.

## Features

- Public Home, About, Gallery, Annual Reports, and Contact pages
- Supabase authentication and protected portal routes
- Dashboard KPIs, trends, expense mix, and pending collections
- Searchable member, donation, and expense CRUD tables
- PDF/Excel exports, light/dark themes, and mobile navigation
- PostgreSQL schema, validation, roles, indexes, and row-level security
- Excel workbook importer and demo data before Supabase is connected

## Setup

Requires Node.js 20+ and npm 10+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Demo data works without environment variables; authentication and persistence require Supabase.

## Supabase

1. Create a project and run `supabase/migrations/001_initial_schema.sql` in its SQL editor.
2. Add the URL and keys from `.env.example` to `.env.local`.
3. Create the first Authentication user, then promote it:

```sql
update public.users set role = 'admin' where email = 'your-email@example.com';
```

The service-role key is only for the offline importer. Never expose it in browser code or commit `.env.local`.

## Import the workbook

Place `AB Sandha_nankodai Sheet.xlsx` in the root and run:

```bash
npm run import:excel -- "AB Sandha_nankodai Sheet.xlsx"
```

The utility accepts common column aliases (`Member Name`/`Name`, `Family`/`Family Name`, `Phone`/`Mobile`, and `Amount`/`Donation`/`Sandha`) and detects years in sheet names. Test with a workbook copy and database backup first.

## Roles

| Role | Access |
|---|---|
| Admin | Manage members, donations, expenses, users, and balances |
| Treasurer | Manage donations and expenses; view members and reports |
| Viewer | Read-only dashboard and reports |

RLS enforces these permissions in PostgreSQL.

## Verify and deploy

```bash
npm run typecheck
npm run lint
npm run build
```

Import the repository into Vercel using the Next.js preset and configure the variables in `.env.example`.

```text
app/                    Next.js routes
components/             Charts, tables, forms, navigation
lib/                    Types, utilities, Supabase clients
scripts/import-excel.ts Workbook importer
supabase/migrations/    Schema and RLS policies
middleware.ts           Session and route protection
```
