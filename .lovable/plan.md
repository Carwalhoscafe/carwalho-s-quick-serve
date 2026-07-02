## What's already tracked to Google Sheets today

- **Orders tab** — every confirmed order (number, date/time, customer, items, total, payment, status, ETA).
- **Contact tab** — contact form messages.
- **Newsletter tab** — email signups.
- **Logins/Users** — nothing today.

## Plan

### 1. User tracking (Users tab in Google Sheets)

- Add a `logUserSignIn` server function (uses `requireSupabaseAuth`) that upserts a single row per user in a `Users` worksheet: `user_id, email, name, provider, first_seen, last_seen, login_count`.
- Call it once on session establishment from `src/routes/__root.tsx` inside the existing `onAuthStateChange` listener (fire on `SIGNED_IN` only, dedupe per session so tab-focus token refreshes don't spam it).
- Because Sheets has no native upsert, the fn will read the `Users` sheet, find the row by `user_id`, then either append (first login) or update `last_seen` + increment `login_count`. Uses the same gateway helpers already in `integrations.server.ts`.

### 2. Swiggy-style My Orders page (`/account/orders`)

Rebuild the existing page with three chosen features:

**Order card (list view)**
- Left: stacked circular thumbnails of the products in the order (uses existing product images from `src/lib/cart.tsx`).
- Middle: order status pill (Confirmed / Preparing / Out for delivery / Delivered / Cancelled) + timestamp + ETA line + short "Item A, Item B and 1 more" summary.
- Right: total (₹), and two buttons: **View details** and **Reorder**.
- Divider between orders, subtle hover lift, Swiggy-style spacing.

**Order detail drawer** (Shadcn Sheet, slides from right, matches CartDrawer)
- Header: order number, placed-at, status pill, ETA.
- Items list with thumbnail, name, qty × unit price, line total.
- Bill summary: subtotal, delivery fee, total.
- Delivery block: address, distance, customer phone, notes.
- Payment block: method + payment status.
- Footer CTA: **Reorder** (primary) + **Need help?** link to `/contact`.

**Reorder action**
- Adds a `reorderById` helper in `src/lib/cart.tsx` that takes an order's items and merges them into the current cart (increments qty if already present), opens the cart drawer, and toasts "Added N items to cart".
- Wired to both the list card button and the drawer footer button.

**Data**
- Extend `listMyOrders` to also return `subtotal`, `delivery_fee`, `delivery_address`, `delivery_distance_km`, `notes`, and `order_items.unit_price / product_id` so the drawer can render the full bill and reorder can match items back to the catalog.
- No schema changes needed — all columns already exist.

**Empty state**
- Swiggy-like illustration block with "No orders yet" + CTA to `/menu`.

### 3. Files touched

- `src/lib/integrations.server.ts` — add `upsertUserRow` helper (read Users sheet, find row, append or update).
- `src/lib/users.functions.ts` (new) — `logUserSignIn` server fn.
- `src/routes/__root.tsx` — call `logUserSignIn` on `SIGNED_IN`, guarded by a session-id ref.
- `src/lib/orders.functions.ts` — expand `listMyOrders` return shape; add `getOrderDetail(orderId)` fn for the drawer.
- `src/lib/cart.tsx` — add `reorder(items)` helper.
- `src/components/OrderCard.tsx` (new) and `src/components/OrderDetailDrawer.tsx` (new).
- `src/routes/_authenticated/account.orders.tsx` — rebuilt to use the new components + status filter-free Swiggy layout.

### Out of scope

- No per-login history sheet (you chose Users-only).
- No filter/search on the orders list (not selected).
- No changes to admin dashboard or order-status workflow.
