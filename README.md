# Vault — Personal Finance

A modern, personal finance app for tracking expenses, categories, money owed/borrowed, and credit card balances. Built with Next.js 16, Drizzle ORM, better-auth, and shadcn/ui (base-nova style).

## Features

- **Generic currency & locale** — pick any of 20 supported currencies (USD, EUR, GBP, INR, JPY, …) and 18 locales; all amounts and dates format accordingly.
- **Compact number format** option for big totals (e.g. `$12.3K`).
- **Theme preference** (light / dark / system).
- **Dashboard** with monthly hero stat, month-over-month delta, 6-month sparkline, and top-category breakdown.
- **Expenses** with category, payment method, card, and notes.
- **Categories** with editable color palette and per-category totals.
- **Debts** (owed to you / you owe) with due dates, settle/reopen/delete.
- **Cards** with credit-card visuals, utilization bars, statement/due days.
- **Settings** page for currency, locale, number format, and theme.
- **Email + password** auth and **Google** social sign-in.
- **Light & dark** themes, mobile-friendly, sticky sidebar.

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [better-auth](https://www.better-auth.com) (email/password + Google OAuth)
- [Drizzle ORM](https://orm.drizzle.team) on PostgreSQL
- [shadcn/ui](https://ui.shadcn.com) (base-nova style) on top of [Base UI](https://base-ui.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Lucide](https://lucide.dev) icons

## Getting started

### 1. Install dependencies

```bash
npm install
# or pnpm install / yarn
```

### 2. Configure environment

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string (Drizzle + better-auth) |
| `BETTER_AUTH_SECRET` | yes | Long random string. Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | no | Override the inferred base URL |
| `GOOGLE_CLIENT_ID` | for Google sign-in | OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | for Google sign-in | OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | no | Optional client-side mirror of `GOOGLE_CLIENT_ID` |

For Google sign-in, create OAuth credentials at https://console.cloud.google.com/apis/credentials and add this **Authorized redirect URI**:

```
https://<your-domain>/api/auth/callback/google
```

### 3. Set up the database

```bash
# Generate the migration from the Drizzle schema
npm run db:generate   # or: pnpm drizzle-kit generate

# Apply the migration to your Postgres database
npm run db:migrate    # or: pnpm drizzle-kit push
```

The schema includes a `user_preferences` table for currency/locale/theme. It's read with safe fallbacks to defaults if the table doesn't exist yet, so the app boots even before the migration is applied.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment to Vercel

1. Push to GitHub and import the project on Vercel.
2. Add the env vars from the table above in the Vercel project settings.
3. Run the Drizzle migration against your production Postgres before the first deploy (or via a release script).

The included `vercel.json` uses the default Next.js build (`next build` / `.next`).

## Project structure

```
app/
  (app)/               auth-protected routes (sidebar layout)
    page.tsx           Dashboard
    expenses/          Expenses list
    categories/        Category manager
    debts/             Owed & Credit
    cards/             Cards
    settings/          Settings (currency/locale/theme)
    layout.tsx         auth guard + sidebar
  sign-in/, sign-up/   Auth pages
  api/auth/[...all]/   better-auth catch-all
  actions/             Server actions
components/            UI components (CardManager, DebtList, etc.)
lib/
  auth.ts              better-auth config
  format.ts            Generic currency / date formatters
  get-preferences.ts   Per-user preferences helper
  db/                  Drizzle schema + pg pool
```

## Notes

- The app uses `Intl.NumberFormat` for currency, so any BCP 47 locale works. If you need a currency not in the picker, add it to `CURRENCIES` in `lib/format.ts`.
- The `vercel.json` is minimal — Vercel's default Next.js preset is used.
- All `ignoreBuildErrors: true` style warnings are pre-existing project config, not introduced here.
- Global error and loading boundaries are in place, so transient DB or migration issues surface a friendly message instead of a blank 500.
