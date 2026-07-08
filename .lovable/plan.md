## What I'll build

### 1. Email verification with 6-digit code (signup + password reset)

Replace the current "click a link in email" flow with a code-entry flow.

- **Signup**: user enters name/email/password → we call Supabase `signUp` with the "email" OTP variant → user sees a 6-digit code input on the same auth page → on submit we call `verifyOtp({ type: 'signup', token, email })` → session is set, redirected to `next` or home.
- **Password reset**: "Forgot password?" → user enters email → we send a recovery OTP → user types the 6-digit code + new password → we call `verifyOtp({ type: 'recovery', token, email })` then `updateUser({ password })` → signed in with new password.
- Update the existing auth email templates (`signup` and `recovery` in `src/lib/email-templates/`) to prominently show the `{{ .Token }}` code (big, monospace) with the link kept as a fallback below.
- Add a resend-code button with a 30s cooldown, and clear error states for expired/invalid codes.

### 2. Fix ChatGPT (MCP) — "unauthorized request origin"

The OAuth authorize call is coming from `https://www.carwalhoscafe.in/` but the managed OAuth server's redirect/origin allow-list doesn't include the custom domain, so `/oauth/authorizations/...` returns 400. Fix by:

- Re-running the managed OAuth server configuration so the canonical Site URL and allow-list pick up the current custom domain (`www.carwalhoscafe.in`) alongside the Lovable domains.
- Verifying with the OAuth debug tool that `www.carwalhoscafe.in` appears in the trusted redirect list and consent URL is reachable.
- Confirming the consent route `/.lovable/oauth/consent` preserves `authorization_id` through both sign-in and sign-up (already present, will spot-check).

No code change is expected beyond a possible tweak to the consent route's return-URL preservation if the check surfaces a gap.

### 3. Google auth on desktop

You said it's working now — I'll skip changes and just re-verify with a Playwright run on desktop viewport to confirm.

### 4. Swiggy-style location picker

New reusable `LocationPicker` component used on the Checkout page (and available on a "My addresses" section under the account menu).

Features:
- **Detect current location** button → browser Geolocation → reverse-geocode via Google Maps gateway → prefill address.
- **Search with autocomplete** using Places API (New) `AutocompleteSuggestion.fetchAutocompleteSuggestions()` with a session token and 250ms debounce.
- **Draggable pin on a Google Map** centered on the selected/detected location; dragging the marker updates lat/lng and re-reverse-geocodes to refresh the address text; user can also fine-tune house/flat number and landmark in separate inputs.
- **Saved addresses** (Home / Work / Other) for signed-in users: pick from a list, add new, edit, delete, set default. New table `public.saved_addresses` with RLS scoped to `auth.uid()`.
- Checkout wires the selected address (label, formatted address, lat, lng, landmark) into the order payload it already builds.

### Files (technical)

Frontend
- `src/routes/auth.tsx` — split into email step + OTP step; add password-reset OTP flow; add resend cooldown.
- `src/lib/email-templates/signup.tsx`, `recovery.tsx` — surface `{{ .Token }}` prominently.
- `src/components/location/LocationPicker.tsx` (new) — map + autocomplete + GPS + draggable marker.
- `src/components/location/SavedAddresses.tsx` (new) — list/add/edit/delete/set-default.
- `src/routes/_authenticated/account.addresses.tsx` (new) — manage saved addresses.
- `src/routes/_authenticated/checkout.tsx` — use `LocationPicker` and saved addresses.
- `src/lib/maps/*.functions.ts` — server fns for reverse-geocode via connector gateway.

Backend
- Migration: `public.saved_addresses` (label, recipient_name, phone, line1, line2, landmark, city, pincode, lat, lng, is_default, user_id) with GRANTs + RLS `auth.uid() = user_id`.

Config
- `supabase--configure_oauth_server` re-run to refresh Site URL / allow-list for the custom domain.

### Verification

- Playwright: sign up with a test address, receive OTP (check auth logs), type it, confirm session lands on `/`.
- Playwright: forgot password → OTP → new password → sign in.
- curl the MCP `/.well-known/oauth-protected-resource` and `/oauth/authorize` from the custom domain to confirm no more "unauthorized request origin".
- Playwright on desktop: Google sign-in completes to a session.
- Playwright: Checkout → detect location, search, drag pin, save address, place order.

### Out of scope

- No redesign.
- No changes to the menu, cart, orders list, GA4, or email logo (all done previously).
