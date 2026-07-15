# Carwalho's Cafe — Production Auth Overhaul

Replace the current email-OTP-code flow with a proper email + password system (Razorpay/Amazon style), while keeping Google Sign-In and Phone OTP as optional. Add signup, email verification, password reset, account/security pages, and rate limiting.

---

## 1. Supabase Auth configuration

- Enable email + password provider; disable auto-confirm (users must verify).
- Keep Google + Phone providers enabled.
- Site URL: `https://www.carwalhoscafe.in`; redirect allow-list includes `/auth/callback` and `/auth/reset-password`.
- Enable HIBP (leaked password) check.
- Auth-email rate limit raised to a sensible cap.
- Password minimum length 8 (Supabase-side); complexity enforced client-side.

## 2. Database (new migration)

- `profiles` table linked to `auth.users(id)` with: `first_name, last_name, email, phone, avatar_url, loyalty_points (default 0), created_at, updated_at`. RLS: user reads/updates own row; admins read all.
- Trigger `handle_new_user()` → auto-creates profile row on signup, copying `first_name`, `last_name`, `phone` from `raw_user_meta_data`, and `email`.
- `login_activity` table: `user_id, occurred_at, ip, user_agent, device, browser, country, success`. RLS: user reads own; service_role inserts.
- Roles remain in existing `user_roles` table (no change).
- Grants + RLS on both new tables.

## 3. Routes / pages

- `/auth` — redesigned **Sign In** page (email + password default, Google button, "Continue with phone" toggle, Remember me, Forgot password, link to Create Account). Caps-lock warning, show/hide password.
- `/auth/signup` — Create Account (first/last name, email, phone, password, confirm password, terms checkbox, live strength meter, HIBP-aware errors).
- `/auth/forgot-password` — request reset email.
- `/auth/reset-password` — set new password (handles `type=recovery` hash); on success signs out other sessions.
- `/auth/verify` — "check your inbox" state + Resend verification.
- `/auth/callback` — handles OAuth + email confirmation + recovery redirects, then routes to `next`.
- `/account` — dashboard hub: greeting, quick links to Orders, Addresses, Profile, Security, Logout.
- `/account/profile` — edit name / phone / avatar.
- `/account/security` — change password, recent login activity table, sign out everywhere.

Existing `/account/orders` and `/admin/orders` remain; admin gate reuses `has_role(uid,'admin')`.

## 4. Server functions

- `signUpWithPassword` (public serverFn): validates with zod, calls `supabaseAdmin.auth.signUp` with `email_confirm: false`, stores metadata, triggers verification email via existing branded Supabase template.
- `recordLoginActivity` (authenticated serverFn): called from client on `SIGNED_IN`; parses UA, geo-IPs via request headers (`cf-ipcountry`), inserts row.
- `changePassword` / `signOutEverywhere` via client `supabase.auth.updateUser` + `signOut({ scope: 'others' })`.
- Rate limiting: 5 failed attempts / 15 min lockout, tracked in a small `auth_attempts` table keyed by email + IP, checked in a `preSignIn` serverFn that returns a lock signal before we hit Supabase.

## 5. Email templates

- Update existing `signup.tsx` (confirm signup) and `recovery.tsx` templates to use link-based flow (button + fallback), not the 6-digit code. Keep branded header.
- Magic-link template stays but is no longer used by primary flow (kept for phone-less recovery edge cases).

## 6. UI / design

- Large centered card, rounded-2xl, brand green + gold accents, matches existing site typography (Cormorant + Work Sans).
- Fully responsive; framer-motion micro-animations on card entry and button states.
- Accessible: labels, aria-invalid, focus rings, keyboard nav.

## 7. Session & security

- Remember Me → `supabase.auth.setSession` persistence toggle via localStorage vs sessionStorage wrapper (client-only).
- Sign-out clears query cache, calls `supabase.auth.signOut()`, navigates home.
- Google OAuth `redirect_uri` = `https://www.carwalhoscafe.in/auth/callback` (public route), preserves `next` through search.
- CSRF/HTTPS/SameSite handled by Supabase cookies + our HTTPS-only hosting.

## 8. Migration of existing users

- Users who signed up via email-code already exist in `auth.users` without a password. On first sign-in attempt they'll be routed to "Set a password" via the forgot-password flow — surfaced with a helpful message if `Invalid login credentials` matches an existing OTP-only account.

---

## Out of scope for this pass

- Two-factor authentication (can be added later).
- Social providers beyond Google.
- Loyalty points logic (column added, no accrual rules yet).

Approve and I'll ship it in one migration + route batch.
