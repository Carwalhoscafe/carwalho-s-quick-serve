## Status of last session

The 5km radius check was **never implemented** - it only exists as marketing copy on `about`, `menu`, `index`, `shipping`, and `terms`. Checkout takes a free-text textarea; `submitOrder` accepts any string. Nothing to "finish" - it's a clean build.

Also: there are pending 500s on `GET /` I'll fix quietly as part of this work.

---

## Part 1 - Real 5km delivery radius (Google Maps)

**Connector**: link the Google Maps Platform connector (gateway-backed - no API key request needed from you).

**Shop origin**: Alagappa Nagar, Pallavaram, Chennai 600117. I'll geocode once and hardcode the lat/lng constant (`SHOP_LAT`, `SHOP_LNG`) to save per-order calls.

**Client side (`/checkout`)**
- Replace the free-text address textarea with a Google Places autocomplete input (`PlaceAutocompleteElement`, biased to Chennai), plus an optional "flat/floor/landmark" line.
- On selection, capture `place_id`, formatted address, lat, lng.
- Immediately compute haversine distance from shop. If > 5km, show inline error "Sorry, you're X.X km away - we only deliver within 5 km of Pallavaram" and disable Place Order.
- Pickup orders skip the check entirely.

**Server side (authoritative, `submitOrder`)**
- Extend Zod input: when `order_type === "delivery"`, require `delivery_lat`, `delivery_lng`, `delivery_address`.
- Recompute haversine on the server. If > 5km → throw 400. The client check is UX only; the server is the gate.
- Persist `delivery_lat`, `delivery_lng`, `delivery_distance_km` on the order row (new columns) so admin can see distance and we have an audit trail.

**Schema migration**: add `delivery_lat numeric`, `delivery_lng numeric`, `delivery_distance_km numeric` to `orders` (nullable - pickup orders won't have them).

---

## Part 2 - Admin dashboard (`/admin/orders`)

**Access control (user_roles pattern)**
- Migration creates: `app_role` enum (`admin`, `customer`), `user_roles` table (`user_id`, `role`, unique), `has_role(uid, role)` security-definer function. Standard grants + RLS (users see own roles; only admins write - via `has_role`).
- Extend `orders` / `order_items` RLS: admins can SELECT all and UPDATE order status.
- After the migration runs, I'll insert one row granting `lawrance@carwalhoscafe.in` the `admin` role (looked up from `auth.users` by email). If that user hasn't signed in yet, I'll tell you and you sign in once, then I run the grant.

**Route structure**
- New pathless layout `src/routes/_admin/route.tsx` (mirrors `_authenticated/route.tsx` pattern, `ssr: false`): checks session + calls a `requireAdmin` server fn that runs `has_role(uid, 'admin')`. Non-admins → redirect to `/`.
- New page `src/routes/_admin/admin.orders.tsx` → `/admin/orders`.

**Page UI** (on-brand, consistent with `/account/orders` - same card/table styling, cream/primary tokens)
- Sortable table: Order #, Time (IST), Customer (name + phone), Items (compact list), Type (delivery/pickup), Distance (km, delivery only), Payment, Status (colored), Total.
- Status dropdown per row: `confirmed → preparing → ready → completed` (also `cancelled`). Inline update via `updateOrderStatus` server fn (admin-gated, uses `has_role`).
- Simple filters: status (all/active/completed), date (today/this week/all).
- Auto-refresh every 30s via TanStack Query.

**Header link**: small "Admin" link in `SiteHeader` shown only when `has_role(uid,'admin')` returns true (cached query).

**Out of scope** (per your message): contact messages, inventory, reviews, customer list - none touched.

---

## Files

New:
- `src/lib/geo.ts` - shop constants + haversine helper (isomorphic)
- `src/lib/admin.functions.ts` - `requireAdmin`, `listAllOrders`, `updateOrderStatus`, `amIAdmin`
- `src/routes/_admin/route.tsx` - admin gate layout
- `src/routes/_admin/admin.orders.tsx` - dashboard
- `src/components/AddressAutocomplete.tsx` - Places (New) browser autocomplete

Modified:
- `src/routes/checkout.tsx` - replace textarea with autocomplete + distance check + lat/lng in payload
- `src/lib/orders.functions.ts` - validate lat/lng, server-side haversine, persist distance
- `src/components/SiteHeader.tsx` - conditional Admin link
- `src/integrations/supabase/types.ts` - regenerated post-migration

Migrations (two, run sequentially):
1. Add `delivery_lat/lng/distance_km` to `orders`.
2. Create `app_role`, `user_roles`, `has_role`, grants, RLS policies, extend `orders` policies for admin SELECT/UPDATE.

---

## Open item I'll handle without asking

The two 500s on `GET /` showing in runtime errors - I'll read the stack and fix as part of this pass.

## What I need from you before building

1. Approve this plan.
2. I'll link the Google Maps connector via the connect tool (no key request - it's workspace-managed).
3. Confirm `lawrance@carwalhoscafe.in` has signed into the site at least once (so there's an `auth.users` row to grant admin to). If not, sign in once after the migration and I'll seed the role.