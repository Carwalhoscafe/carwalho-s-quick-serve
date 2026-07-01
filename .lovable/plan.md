# Auth emails + seamless sign-in/out

## 1. Upload the new white logo as a CDN asset
- Run `lovable-assets create` on the uploaded `carwalho_s_CAFÉ_white_logo.png` (1069×110, transparent) → `src/assets/carwalhos-email-logo-white.png.asset.json`.
- Use its CDN URL as `BRAND.logo` in `src/lib/email-templates/_brand.ts`.
- Keep the dark-green header; adjust logo width to ~200px so the wide wordmark reads well at retina.

This automatically updates all six auth templates (signup, magic link, recovery, invite, email change, reauthentication) since they all consume `BRAND.logo`.

## 2. Verify + light-polish each template
Quick pass over the 6 templates to confirm:
- Preview text is meaningful.
- Reauthentication template shows the 6-digit `token` prominently.
- Recovery template CTA copy = "Reset my password" (currently generic in some).
- Footer line "Mon–Fri · Order before 10:00 AM for same-day delivery" is present.
No structural rewrites — brand file change does the heavy lifting.

## 3. Seamless login/logout
Currently:
- `/auth` handles Google + email magic link + phone OTP, and auto-navigates on `SIGNED_IN`. ✓
- There is no visible **Sign out** control anywhere in `SiteHeader`, and no account menu — signed-in users can't sign out without going to `/account/orders`.

Changes:
- **`SiteHeader.tsx`**: add a small auth affordance on the right (next to Cart).
  - Signed out → `Sign in` link → `/auth`.
  - Signed in → compact avatar/initial dropdown with: **My orders** (`/account/orders`), **Sign out**.
  - Uses `supabase.auth.getUser()` on mount + `onAuthStateChange` subscription so it updates instantly across tabs.
- **Sign out handler**: `await supabase.auth.signOut()` then `navigate({ to: '/' })` and clear cart-persist only if user prefers (leave cart alone by default — matches premium ecom UX).
- **Post-login return-to**: `/auth` already respects `?next=`. Confirm `SiteHeader`'s Sign in link preserves current path via `next=` so users land back where they started.
- **Magic link / OAuth callback**: already redirect to `PROD_ORIGIN + /auth?next=…`, which the existing `SIGNED_IN` listener forwards. ✓

## 4. No backend / schema changes
No migrations, no new server functions, no changes to `/lovable/email/auth/webhook.ts` — the webhook already renders whichever logo `_brand.ts` exports.

## Files touched
- `src/assets/carwalhos-email-logo-white.png.asset.json` (new)
- `src/lib/email-templates/_brand.ts`
- `src/lib/email-templates/recovery.tsx`, `reauthentication.tsx` (copy polish only)
- `src/components/SiteHeader.tsx` (auth menu)

## Out of scope
- Changing auth providers or adding new sign-in methods.
- Redesigning `/auth` page.
- Email delivery infra (already set up on `notify.carwalhoscafe.in`).
