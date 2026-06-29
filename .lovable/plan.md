
# Plan: Email reliability, order ETA, and Sheets verification

## Part 1 — Auth emails (branded, via Lovable's email pipe)

You don't have Supabase dashboard access on Lovable Cloud, so the cleanest fix is to route auth emails through Lovable's managed email infrastructure (same `no-reply@carwalhoscafe.in` sender already used for order emails).

Steps:
1. Check email-domain status. The order pipe already sends from `carwalhoscafe.in`, so the domain is verified — no setup dialog needed.
2. Run email infrastructure setup (idempotent — creates the queue, cron job, suppression tables if not already there).
3. Scaffold branded auth email templates (`signup`, `magiclink`, `recovery`, `invite`, `email_change`, `reauthentication`). Apply Carwalho's brand styling (cream bg `#fbf7ee`, deep green `#0f3d2e`, gold `#c79a3a`, logo header) to match `emails.server.ts`.
4. In `src/routes/auth.tsx`, hardcode `emailRedirectTo: "https://www.carwalhoscafe.in/auth/callback"` on both `signInWithOtp` (email magic link) and the phone OTP flow's post-verify navigation. This kills the "magic link lands on preview" bug.
5. For Google OAuth via the lovable broker, set `redirect_uri: "https://www.carwalhoscafe.in"` similarly.

## Part 2 — Order emails (Path B)

1. Verify the Resend connector is connected and `RESEND_API_KEY` is current. If disconnected, run the connect flow. No code change to `integrations.server.ts` unless the connector is healthy and emails still fail.
2. After the test order in the acceptance test, inspect server-function logs for `[resend]` failure lines.

## Part 3 — Order received time + estimated delivery (new)

### New file: `src/lib/delivery-estimate.ts`
Isomorphic, no deps. Exports:
- `computeEstimatedDelivery(orderType, placedAt) → { receivedLabel, etaLabel }`
- IST-aware (`Asia/Kolkata` via `toLocaleString` options, no tz library).
- Rule (from Shipping Policy, Mon–Fri 10:00–14:00 IST):
  - Inside window on a weekday → `etaLabel = "Later today"`.
  - Outside window or weekend → roll forward to next weekday → `etaLabel = "<Weekday> morning"` (e.g., "Tuesday morning").
- `receivedLabel`: `"30 Jun, 2:14 PM"` in IST.
- Pickup branch accepted but returns same shape for now.

### Migration
Add nullable `estimated_delivery_label text` to `public.orders`. (Column-only — RLS/grants unchanged.)

### Wire into `submitOrder` (`src/lib/orders.functions.ts`)
- After insert, compute estimate from `order.created_at`.
- Update the row with `estimated_delivery_label`.
- Pass `etaLabel`/`receivedLabel` to both email templates and the Sheets row.

### Surface the stored label (read column, don't recompute) on:
1. `src/routes/checkout.tsx` — `done` state replaces the generic confirmation copy with "Received <receivedLabel> · Estimated delivery: <etaLabel>".
2. `src/lib/emails.server.ts` — add a single line under order number in both `customerConfirmationEmail` and `adminNotificationEmail`.
3. `src/routes/_authenticated/account.orders.tsx` — show ETA per order row.
4. `src/routes/_admin/admin.orders.tsx` — add "ETA" column; include `estimated_delivery_label` in `listAllOrders` select in `src/lib/admin.functions.ts`. Also include it in `listMyOrders`.

`submitOrder` returns `{ order_number, order_id, estimated_delivery_label, received_label }` so the confirmation screen renders without an extra fetch.

## Part 4 — Sheets

- Append `estimated_delivery_label` as the final column of the Orders row in `submitOrder` (one-line change). No new worksheets.
- Verification happens during the acceptance test, not via code. If the row doesn't land, the next step is to check `resolveSpreadsheetId()` is finding the file — no preemptive change.

## Files

**New**
- `src/lib/delivery-estimate.ts`

**Modified**
- `src/lib/orders.functions.ts` (compute + persist + return ETA, pass to email/sheets, include in `listMyOrders` select)
- `src/lib/admin.functions.ts` (include `estimated_delivery_label` in select)
- `src/lib/emails.server.ts` (add ETA line in both templates; extend `OrderEmailData`)
- `src/routes/checkout.tsx` (render ETA on done state, hardcode prod redirect for magic link)
- `src/routes/auth.tsx` (hardcode `emailRedirectTo`/Google `redirect_uri` to `https://www.carwalhoscafe.in`)
- `src/routes/_authenticated/account.orders.tsx` (show ETA)
- `src/routes/_admin/admin.orders.tsx` (ETA column)

**Migration**
- `ALTER TABLE public.orders ADD COLUMN estimated_delivery_label text;`

**Scaffolded by tools (not hand-written)**
- `supabase/functions/auth-email-hook/...` + 6 React Email templates under `_shared/email-templates/`, branded.

## What I'll do at build time vs what you handle

I'll do:
- Email infra + auth template scaffold + brand styling
- Hardcode prod redirect URLs in auth flows
- Connector reconnect prompt if Resend shows disconnected
- All Part 3 + Part 4 code & migration

You handle (out-of-band, after build):
- Google Maps key referrer allowlist for `carwalhoscafe.in` / `www.carwalhoscafe.in`
- Footer copy fix (separate pass — not in this plan)

## Acceptance test
Same 11-step flow you listed. I'll run a smoke pass on what I can verify in the sandbox (compile, server-fn logs, migration applied) but the inbox/Sheets/live-domain checks are yours to confirm.
