# Shivtej Tarun Ganesh Mandal — Vargani (Ganeshotsav Donation) Website

A bilingual (Marathi/English) donation site for Ganeshotsav vargani collection, with
Razorpay checkout, auto-generated PDF receipts, and an admin dashboard.

Built with Next.js 14 (App Router) + TypeScript + Tailwind + MongoDB + Razorpay +
React Three Fiber for the 3D hero.

## What's included

- **Public site** (`/`): 3D hero, live progress bar toward the mandal's goal, donation
  form (name, phone, amount, optional email/city/message), Razorpay Checkout,
  instant PDF receipt download, scrolling recent-donors wall, Marathi-by-default
  with an English toggle (persisted in the browser).
- **Admin panel** (`/admin`): login-protected dashboard with total collected,
  donor count, today's collection, a searchable/filterable donation table, CSV
  export, and a form to manually log donations received in person or by direct
  UPI transfer.
- No login for donors. Donors never create an account — the flow is
  name → amount → pay → download receipt, as requested.

## 1. Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- A MongoDB database — [MongoDB Atlas](https://www.mongodb.com/atlas) free tier works fine
- A [Razorpay](https://dashboard.razorpay.com/) account (test mode is fine to start)

## 2. Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Connect → Drivers |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` — this one is safe to expose to the browser, Razorpay Checkout needs it client-side |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks → create a webhook pointing to `https://yourdomain.com/api/webhook/razorpay`, subscribe to `payment.captured` and `payment.failed`, then copy the secret shown there |
| `JWT_SECRET` | Any long random string, e.g. output of `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Whatever you want the first admin login to be |
| `MANDAL_NAME` / `MANDAL_ADDRESS` / `MANDAL_UPI_ID` | Shown on receipts |

Create the first admin user:

```bash
npm run seed:admin
```

Run locally:

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin`
to log in to the dashboard.

## 3. How payments are verified (important)

Every donation is created in `created` status, then moves to `paid` in **two
independent ways**, both required for reliability:

1. **Checkout callback** (`/api/donations/verify`) — runs the moment the donor's
   payment succeeds in their browser, verified against the signature Razorpay
   sends back. Gives the donor an instant "download receipt" screen.
2. **Webhook** (`/api/webhook/razorpay`) — the source of truth. Razorpay calls
   this directly from their servers, so it still marks the donation paid even if
   the donor closes the browser tab right after paying before the callback runs.
   **You must configure this webhook in the Razorpay dashboard for the site to
   be reliable** — see the table above.

Both paths verify Razorpay's HMAC signature before trusting anything, and both
are idempotent (safe to run twice for the same payment).

A plain Google Pay UPI ID (outside Razorpay) has no way to notify your server
when a payment happens — that's why it isn't wired into the automatic flow.
The admin dashboard's "+ Add manual donation" is the intended way to log any
donation received by cash, or by a UPI transfer you've personally verified in
your bank/GPay statement.

## 4. Design notes

- Palette and type system are described in `tailwind.config.ts` — a
  Paithani-sari-inspired maroon/gold/saffron/peacock palette rather than a
  generic template look.
- The 3D hero (`src/components/Hero3D.tsx`) is a stylized glowing core with
  orbiting "modaks" — when a donor selects/types an amount, the nearest modak
  glows brighter, visually tying the interaction to the offering.
- Fonts: Yatra One (display), Mukta (body — supports Devanagari), Poppins (for
  numbers/amounts).
- Marathi is the default language; the toggle in the header switches to
  English and remembers the choice per-browser.

## 5. PDF receipts

Receipts are generated server-side with `pdfkit` (`src/lib/invoice.ts`) and are
currently rendered in English only — `pdfkit`'s built-in fonts don't cover
Devanagari glyphs. To print the mandal name/labels in Marathi on the PDF,
embed a Devanagari font (e.g. Noto Sans Devanagari `.ttf`) via
`doc.registerFont(...)` — there's a comment in that file showing where.

Receipts are **donation acknowledgements, not Section 80G tax-exemption
certificates** unless your mandal is a registered trust and you update the
footer text in `src/lib/invoice.ts` accordingly. Please confirm your mandal's
registration status before representing these as tax documents.

## 6. Deploying

This is a standard Next.js app — it deploys as-is to Vercel, or to any Node
host that can run `npm run build && npm run start`. Whichever you choose,
double check:

- `MONGODB_URI` allows connections from your host's IP (Atlas: Network Access)
- The Razorpay webhook URL points at your real deployed domain
- `NODE_ENV=production` so cookies are sent as `secure`

## 7. Project structure

```
src/
  app/
    page.tsx              Public homepage (server component, fetches initial data)
    admin/page.tsx         Admin login
    admin/dashboard/page.tsx  Admin dashboard
    api/                   All API routes (donations, verify, webhook, admin, invoice)
  components/              Hero3D, DonationForm, ProgressBar, DonorWall, LanguageToggle, HomeClient
  lib/                     mongodb, razorpay, auth, i18n, invoice (PDF), signature verification
  models/                  Donation, Admin, MandalConfig, Counter
  middleware.ts            Protects /admin/dashboard and /api/admin/*
scripts/seedAdmin.ts       Creates the first admin user
```

## 8. Known scope / next steps

- Devanagari text isn't embedded in the PDF receipt yet (see §5).
- Recurring/monthly donations aren't included — vargani here is treated as a
  one-time contribution per submission, matching how mandals collect it.
- No automated tests yet — recommend adding at least a smoke test around the
  payment verification + webhook idempotency logic before going live, since
  that's the part handling money.
