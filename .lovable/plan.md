
# Carwalho's Cafe — Delivery Ordering Site

## Scope of this plan
Phase 1: Public site (hero + homepage sections, menu, cart, geofenced checkout with COD, order confirmation, feedback + review submission, basic SEO).
Phase 2: Backend rules (Lovable Cloud DB, server-side validation, owner email notifications, auth, admin panel for orders/products/reviews/settings).
Phase 3: Online payment (Razorpay/Stripe — to be confirmed).

## Design direction
Use the supplied illustration (`Carwalhos_home_page.png`) as a full-bleed hero background, section 1 of the homepage. Apply a subtle dark gradient on the lower third for legibility. Overlay:
- Wordmark "Carwalho's Cafe" (script/serif, gold)
- Tagline: "Fresh Sugarcane Juice & Tender Coconut, Delivered to Your Door."
- Primary CTA "Order Now" → `/menu`; secondary "Our Story" → `/about`.

Palette pulled from the illustration: deep teal-green background, plum/purple accents, warm amber-gold primary, red highlight. Typography: serif display (e.g. Cormorant/Instrument Serif) + clean sans body (Work Sans). Tokens in `src/styles.css` as oklch — no hardcoded colors in components.

Homepage sections beyond hero: short value-prop strip (Fresh / 5km delivery / Mon–Fri 10–2), featured menu preview, "How it works" (3 steps), reviews carousel (approved only), footer with address/phone/email.

## Routes (TanStack Start, file-based)
```
src/routes/
  __root.tsx              shared header/footer, SEO defaults
  index.tsx               homepage (illustration hero + sections)
  menu.tsx                product list + add to cart
  cart.tsx                cart review
  checkout.tsx            address picker, slot, payment method, validation
  order-confirmation.$id.tsx
  about.tsx
  contact.tsx             feedback form
  reviews.tsx             public approved reviews
  review.$orderId.tsx     submit review (token-gated)
  _authenticated/
    admin.tsx             layout (admin-role gate)
    admin.orders.tsx
    admin.products.tsx
    admin.reviews.tsx
    admin.settings.tsx
    admin.feedback.tsx
  api/public/
    razorpay-webhook.ts   (phase 3)
```

## Data model (Lovable Cloud / Postgres)
- `products` (id, name, description, price_paise, unit, image_url, is_active, sort_order)
- `settings` (singleton row: shop_lat, shop_lng, delivery_radius_km=5, min_order_value=30000, bulk_order_threshold, same_day_cutoff='10:00', next_day_cutoff='14:00', standard_delivery_fee, free_delivery_promo_start/end, delivery_days[])
- `orders` (id, user_id, status enum[pending,confirmed,out_for_delivery,delivered,cancelled], subtotal, delivery_fee, total, address_line, lat, lng, distance_km, delivery_date, delivery_window, payment_method[cod,online], payment_status, phone, name, notes, created_at, review_token)
- `order_items` (id, order_id, product_id, name_snapshot, price_snapshot, qty)
- `reviews` (id, order_id unique, user_id, rating 1-5, comment, is_published default false, created_at)
- `feedback` (id, name, email, message, created_at, ip_hash)
- `user_roles` (separate table, app_role enum, `has_role` security-definer fn — per platform rules)

RLS: anon SELECT on active products + published reviews + settings (safe cols only). Authenticated users insert/select their own orders/reviews. Admin role manages everything via `has_role`. All public-schema tables get explicit GRANTs.

## Business rules (server-enforced via `createServerFn`)
`validateAndCreateOrder`:
- Recompute subtotal from DB prices (ignore client totals).
- Reject if subtotal < `min_order_value`.
- Haversine(shop, address) > `delivery_radius_km` → reject with phone CTA.
- Compute `delivery_date` + window via `computeDeliverySlot(now, settings)` (Sat/Sun → next Monday; before same_day_cutoff → today; before next_day_cutoff → today (editable); else next weekday).
- Compute `delivery_fee` (0 inside free-delivery promo window, else standard fee).
- Bulk threshold → return advisory warning, don't block.
- Insert order + items in a transaction, generate signed `review_token`.
- Email owner via Resend (or Lovable AI email) on confirmation; email customer order summary.

Address picker: Leaflet + OpenStreetMap Nominatim (free) with map pin for lat/lng. Free-text fallback for line 2/landmark only.

## Reviews & feedback
- Review page only renders if `order.status='delivered'` and token matches. One review per order (unique constraint).
- On submit: insert `is_published=false`, email `reviews@carwalhoscafe.in`.
- Feedback: open form with honeypot + 1/min IP rate-limit, emails `support@carwalhoscafe.in`.

## Auth & admin
- Lovable Cloud auth (email/password + magic link). Customers auto-create account at checkout (or guest checkout w/ email — TBD, see Q1).
- Admin tab gated by `_authenticated/` layout + `has_role(user,'admin')` check in loader; seeded admin via migration.
- Admin: order list with status transitions, product CRUD, review approve/reject, settings editor, feedback inbox.

## SEO & polish
- Per-route `head()` with unique title/description/OG.
- Single H1 per page, semantic landmarks, alt text on the hero illustration.
- Mobile-first (most customers will order from phones).

## Open questions (will ask after plan approval)
1. Guest checkout vs forced sign-up?
2. Payment provider for Phase 3 — Razorpay (India-native, supports UPI) or Stripe?
3. Email provider — use Lovable AI Gateway / Resend integration?
4. Standard delivery fee + bulk threshold default values?

## Build order
1. Design tokens + hero homepage + static menu (no backend).
2. Enable Lovable Cloud → schema, RLS, GRANTs, seed products + settings + admin role.
3. Cart + checkout flow with server-validated order creation (COD only).
4. Owner email notification + order confirmation page.
5. Reviews (token-gated) + feedback form + public reviews page.
6. Admin panel.
7. (Phase 3) Online payment + webhook.
