
## Scope

Four fixes/integrations, then publish. No visual redesign.

### 1. My Orders page (post-login)

The route `src/routes/_authenticated/account.orders.tsx` exists and uses `listMyOrders`. The likely failure is one of:
- `SiteHeader` currently doesn't link to `/account/orders` after sign-in, so it looks "not available"
- Loader throws under prerender because `_authenticated` uses `ssr: false` already — should be fine
- RLS on `orders` denies SELECT

Steps:
1. Read `SiteHeader.tsx` and add a "My orders" link in the account menu (visible only when signed in).
2. Confirm `orders` RLS has `SELECT` policy `TO authenticated USING (auth.uid() = user_id)` and `GRANT SELECT ON public.orders TO authenticated` via `supabase--read_query`; if missing, add via migration.
3. Same for `order_items` (`USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()))`).
4. Manually navigate to `/account/orders` via Playwright with the injected session, screenshot, confirm.

### 2. Checkout not loading

No specific symptom given. Investigate:
1. Open `/checkout` in Playwright with an authenticated session, capture console + network + screenshot.
2. Most likely: page requires cart items → shows empty state; or Google Maps address autocomplete fails to load (browser key referrer). Verify `AddressAutocomplete` and the Maps JS script URL.
3. Fix whatever the reproduction surfaces (add cart guard, fix Maps loader, or fix auth wait).

### 3. Shrink OAuth email header logo 40%

In `src/lib/email-templates/_brand.ts`, change the logo style `maxWidth: '420px'` → `maxWidth: '252px'` (60% of 420). Templates re-use this style, so a single edit propagates.

### 4. Google Maps connector

`.env` already has `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`, so the connector is linked. Verify with `standard_connectors--list_connections` and confirm the current `AddressAutocomplete` still uses Places API (New) through the gateway/browser key. No code change unless the checkout repro shows a Maps failure.

### 5. Google Analytics 4 (G-1DW57ZD8K3)

Already installed globally in `src/routes/__root.tsx` (gtag script + `send_page_view:false` + a route-change effect firing `event: 'page_view'`). No duplicate scripts to add. Verify with Playwright that `gtag` is defined and `dataLayer` receives a `page_view` on navigation.

### 6. Google auth verification

Sign-in path in `src/routes/auth.tsx` uses `lovable.auth.signInWithOAuth('google', …)` — correct. Verify via `supabase--configure_social_auth` provider status and by running the sign-in flow in Playwright (or just checking the button renders and calls into the OAuth broker).

### 7. Publish

After verifications pass and no critical security findings, call `security--get_scan_results`, then `preview_ui--publish`.

## Out of scope

- Any visual redesign (per your answer)
- Rewriting orders/checkout UI
- Any GA duplicate installation

## Verification checklist

- [ ] `/account/orders` renders orders after sign-in (Playwright screenshot)
- [ ] `/checkout` reaches the form (Playwright screenshot)
- [ ] Email header logo renders at ~252px max (visual inspection of rendered HTML)
- [ ] `window.gtag` exists and `dataLayer` gets a `page_view` on route change
- [ ] Google sign-in button initiates OAuth (network request to broker)
- [ ] Publish succeeds
