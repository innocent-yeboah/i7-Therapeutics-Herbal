# i7 Therapeutics Herbal — Setup

The Next.js app lives in the `web/` folder (the parent directory name contains spaces, which prevents `create-next-app` from targeting it directly).

## 1. Prerequisites

- Node.js 20+ recommended (Resend SDK declares `>=20`)
- npm
- A [Supabase](https://supabase.com) project
- A [Paystack](https://paystack.com) account (Ghana / GHS)

## 2. Install dependencies

```bash
cd web
npm install
```

## 3. Supabase database

1. Open **Supabase** → **SQL Editor**.
2. Paste the full contents of `supabase/schema.sql` and run it.
3. Enable **Authentication** → **Email** provider (email + password).
4. After you sign up the first user, promote them to admin:

```sql
update public.users set is_admin = true where email = 'you@yourdomain.com';
```

5. Under **Project Settings** → **API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep server-only; never expose in the browser)

## 4. Environment variables

```bash
cd web
copy .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Public site URL, e.g. `https://yourdomain.com` (used for Paystack callbacks) |
| `NEXT_PUBLIC_SUPABASE_*` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook + cron + order fulfillment (bypasses RLS) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Client-side Paystack (if you extend to inline JS later) |
| `PAYSTACK_SECRET_KEY` | Initialize + verify transactions |
| `CRON_SECRET` | `Authorization: Bearer …` for `/api/cron/appointment-reminders` |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Digits only or E.164, e.g. `233XXXXXXXXX` for site WhatsApp links |
| `TWILIO_*` | Optional: auto WhatsApp sends from the cron job |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional: contact form + admin email follow-ups |

## 5. Paystack

1. Use **test keys** until go-live.
2. In Paystack dashboard, set **Webhook URL** to:

   `https://YOUR_DOMAIN/api/paystack/webhook`

3. Ensure `NEXT_PUBLIC_APP_URL` matches the domain you registered so the **callback URL** in `transaction/initialize` is correct (`/checkout/complete`).

## 6. Cron reminders (optional)

- **Vercel**: `vercel.json` schedules `GET /api/cron/appointment-reminders` daily at 07:00 UTC (adjust as needed). Set `CRON_SECRET` in the project env vars; Vercel Cron will send `Authorization: Bearer <CRON_SECRET>` if you configure it to match.

- **Manual / other hosts**: call the same route with header:

  `Authorization: Bearer YOUR_CRON_SECRET`

Without Twilio credentials, the route logs a WhatsApp (`wa.me`) link and still marks reminders as sent to avoid infinite retries; configure Twilio WhatsApp for automatic delivery.

## 7. Run locally

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local Paystack callbacks, use a tunnel (e.g. ngrok) and set `NEXT_PUBLIC_APP_URL` to the tunnel URL, or test verification via the **Paystack dashboard** and production-like URL.

## 8. Production build

```bash
cd web
npm run build
npm start
```

## Project map

| Path | Description |
|------|-------------|
| `app/` | App Router pages (marketing, shop, booking, checkout, account, admin) |
| `app/actions/` | Server actions (booking, checkout, admin) |
| `app/api/` | Paystack webhook, contact email, cron |
| `lib/supabase/` | Browser, server, service-role, middleware clients |
| `lib/orders/fulfill.ts` | Paystack verify + stock decrement + order `paid` |
| `supabase/schema.sql` | Tables, RLS, seed data, auth trigger |

## Brand & design

- Primary green `#2E7D32`, secondary blue `#1E3A5F`, white background, dark gray text — see `app/globals.css` and `lib/constants.ts`.
- Instagram: [@i7_therapeutics_herbal](https://www.instagram.com/i7_therapeutics_herbal).

## Security notes

- Never commit `.env.local`.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` if exposed.
- Admin routes require `users.is_admin = true`; middleware only enforces authentication for `/admin`.
