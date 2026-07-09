# Email OTP verification (code entered on the web)

Yes — this is fully supported. Supabase generates a **unique 6-digit code per request per email** (cryptographically random, single-use, ~1 hour expiry). Every user, and every new sign-in attempt, gets a different code.

Right now the email flow sends a **magic link** (click-to-sign-in). We'll switch it to an **OTP code** flow (type the code on the site), matching the phone OTP UX already in place.

## Changes

### 1. `src/routes/auth.tsx` — email flow becomes two-step
- Step 1: user enters email → call `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })` **without** `emailRedirectTo`. Omitting the redirect tells Supabase to send the 6-digit code template instead of the magic-link template.
- Step 2: show a 6-digit code input (mirrors the existing phone OTP UI) → call `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
- Add "Resend code" (30s cooldown) and "Change email" controls.
- Keep Google sign-in and phone OTP untouched.

### 2. `src/lib/email-templates/magic-link.tsx` — render the code, not a link
- Supabase passes both `{{ .Token }}` (6-digit code) and `{{ .ConfirmationURL }}` to the template. Update the template to prominently display the **code** (large, letter-spaced, copy-friendly), keep a small "or click to sign in" link as fallback, and add the standard "didn't request this? ignore" line.
- The `signup.tsx` confirm-signup template already shows a token — verify it renders the code the same way for consistency.

### 3. No DB / no server-function changes
- Codes are minted and validated by Supabase Auth. Each request → new random code. No custom storage, no shared codes across users.

## Notes
- Codes expire after ~1 hour and are invalidated once used or once a newer code is requested for the same email.
- If a user is mid-flow and requests a new code, only the latest one works — we'll surface that in the resend confirmation text.
- Nothing about phone OTP, Google OAuth, orders, checkout, or admin changes.
