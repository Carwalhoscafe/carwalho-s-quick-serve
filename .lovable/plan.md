# Additive Integrations Plan (v3 - final)

Browse-public, login-at-checkout, plus the integrations from v2. UI changes are scoped strictly to: a sign-in page, the cart-preserving auth redirect, and an account/orders page. Everything else (hero, menu cards, drawer, footer, policies) stays untouched.

---

## 1. SEO (unchanged from v2)

- `__root.tsx`: switch `BASE_URL` to `https://carwalhoscafe.in`, remove the duplicated short og:title/description/image block that overrides keyword-rich tags, keep LocalBusiness JSON-LD, add Restaurant JSON-LD (`servesCuisine`, `priceRange`, `hasMenu`).
- Per-route `head()` on index, menu, about, contact, reviews, cart, checkout, account, and all 11 policy routes: unique title, description, og:*, self-canonical. `menu.tsx` also gets a `Menu` JSON-LD with the 4 products + prices.
- New `src/routes/sitemap[.]xml.ts` (server route) listing all public URLs.
- New `public/robots.txt` with `Sitemap: https://carwalhoscafe.in/sitemap.xml`.

## 2. GA4 (G-1DW57ZD8K3)

- gtag loader in `__root.tsx` head.
- Init explicitly disables auto pageview to avoid double-counting:
  ```js
  gtag('config', 'G-1DW57ZD8K3', { send_page_view: false });
  ```
- `GAListener` mounted in root subscribes to TanStack Router events and fires `gtag('event','page_view',{ page_path, page_location, page_title })` on every SPA navigation (including the first).

## 3. Lovable Cloud + Schema

Enable Lovable Cloud. Migration creates:

- `public.orders` - `id uuid pk`, `order_number text unique`, `user_id uuid` (nullable at schema level for safety, but always populated in practice since checkout requires login), `customer_name`, `customer_phone`, `customer_email`, `order_type`, `delivery_address`, `notes`, `payment_method`, `payment_status`, `order_status` default `confirmed`, `subtotal`, `delivery_fee`, `total`, `created_at`.
- `public.order_items` - `id`, `order_id fk`, `product_id`, `product_name`, `unit_price`, `qty`, `line_total`.
- GRANTs to `authenticated` and `service_role`. RLS: user can `SELECT` their own orders and items; INSERTs go via service-role server fn.

## 4. Auth (Supabase) - login at checkout only

Methods enabled: **Email (magic link - one-tap, no password reset UI to build), Phone OTP, Google OAuth** (via Lovable broker, redirect_uri = `window.location.origin/auth/callback`). `configure_social_auth` called in the same turn Google is wired up.

UI changes (the only new UI in this plan):

- **`/auth`** - simple branded sign-in page with three tabs: Email magic link, Phone OTP, Google. Public route, SSR off. Accepts `?redirect=` search param.
- **`/auth/callback`** - public route that waits for `supabase.auth.getSession()`, then `navigate({ to: redirect ?? '/checkout' })`.
- **Cart preservation** - cart is already in `localStorage` via `CartProvider`, so it survives the OAuth round-trip automatically. No code change needed for cart persistence; just verified.
- **Checkout gating** - `checkout.tsx` stays a public route (so cart contents render for logged-out users too), but the "Place Order" button checks `supabase.auth.getUser()` on click; if no user, `navigate({ to: '/auth', search: { redirect: '/checkout' } })`. No `_authenticated` move for `/checkout` - that would blank the cart preview for guests.
- **Header** - small "Sign in" / "My account" link added to `SiteHeader.tsx`. Existing layout, just one extra link. (If you'd rather skip this, say so and I'll leave the header untouched - login still works from the checkout button.)

## 5. Order Submission

- `src/lib/orders.functions.ts` `submitOrder` with `.middleware([requireSupabaseAuth])`:
  1. Server-side recompute of subtotal/fees/total against `PRODUCTS`.
  2. Insert `orders` + `order_items` via `supabaseAdmin` (lazy-imported inside handler).
  3. Generate `order_number` (`CC-YYYYMMDD-####`).
  4. Fire `sendOrderEmails(order)` and `appendOrderToSheets(order)` - both in try/catch, never block the order.
  5. Return `{ orderNumber, total }`.
- `checkout.tsx` "Place Order" button calls it via `useServerFn`. UI labels and layout unchanged. Razorpay confirmation still out of scope for this turn (cod -> pending, razorpay -> pending until you wire payment confirmation).

## 6. Account / Order History (new UI)

- **`/account/orders`** under `_authenticated/` (integration-managed gate redirects to `/auth`).
- Loader calls a `getMyOrders` server fn (`requireSupabaseAuth`) returning the user's orders + items via RLS as that user.
- Page: order # · date · items list · total · status. Card list, on-brand (deep teal headings, amber accents), no new design system work.

## 7. Resend Emails

- Link `Carwalho's Cafe Resend` connector.
- `src/lib/email/templates.ts` - two inline-CSS branded templates (green logo, palette tokens).
- `src/lib/email/send.server.ts` `sendOrderEmails(order)`:
  - Customer: `From: Carwalho's Cafe <no-reply@carwalhoscafe.in>`, `Reply-To: support@carwalhoscafe.in`. Order #, items, total, payment, delivery/pickup, contact.
  - Admin -> `lawrance@carwalhoscafe.in`: customer + contact + address + payment + notes + lines + totals + timestamp.
- **Prereq for you**: verify `no-reply@carwalhoscafe.in` (and the `carwalhoscafe.in` domain SPF/DKIM) as a verified sender in your Resend account before going live. Zoho hosting the inbox doesn't authorize Resend to send as it. I'll log a clear error if Resend 403s.

## 8. Google Sheets Reporting

- Link `Carwalho's Cafe Google Sheets` connector.
- Resolve spreadsheet `Carwalho's Cafe Business System` via Drive search. If 0 or >1 match, I'll pause and ask for the spreadsheet ID.
- Store ID as runtime secret `SHEETS_SPREADSHEET_ID`.
- **Append logic** (writes):
  - `appendOrder` -> `Orders`: Order ID, Date, Time, Name, Phone, Email, Order Type, Items, Quantity, Total, Payment Method, Payment Status, Order Status, Notes.
  - `appendContactMessage` -> `Contact Messages`: Date, Time, Name, Phone, Email, Subject, Message.
  - `appendNewsletterSignup` -> `Newsletter Subscribers`: Date, Time, Name, Email, Source, Status.
- **Confirm-exists-only** (no writes, just startup sanity check): `Menu Management`, `Customers`, `Reviews`, `Inventory`, `Expenses`, **`Sales Dashboard`**. If any are missing the deploy log warns; the app does not touch them.
- All Sheets calls wrapped in try/catch; failures logged, never break user flow.

## 9. Contact & Newsletter Backends (no UI per your option a)

- `submitContactMessage` server fn -> `appendContactMessage`.
- `subscribeNewsletter` server fn -> `appendNewsletterSignup`.
- Existing contact/footer UI untouched. Wire forms to these later.

---

## Out of scope (explicitly)
- Tax/GST fields - not applicable.
- Razorpay payment confirmation - separate turn.
- Redesign of any existing page beyond adding `/auth`, `/auth/callback`, `/account/orders`, and one header link.

## After deploy you do
- Verify `no-reply@carwalhoscafe.in` + domain in Resend dashboard.
- Point `carwalhoscafe.in` DNS at the Cloudflare Worker (config already in `wrangler.toml`).

Ready to switch to build mode on approval.
