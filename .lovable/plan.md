## 1. Fix Google sign-in

Symptom: clicking "Continue with Google" on `/auth` fails. The OAuth helper (`lovable.auth.signInWithOAuth("google", ...)`) is wired correctly in `src/routes/auth.tsx`, but the Google provider must be enabled in Lovable Cloud auth or the call returns "Unsupported provider".

- Run `supabase--configure_social_auth` with `providers: ["google"]` to enable managed Google OAuth.
- Keep `redirect_uri` as the production origin (already set to `https://www.carwalhoscafe.in/auth`). No code change to the button itself.
- Verify in preview by clicking Google and confirming the consent screen loads.

## 2. Customer reviews on `/reviews`

Goal: any signed-in customer can post a review; reviews show publicly on `/reviews`. Keep visuals consistent with the existing dark/cream/primary palette.

### Database (one migration)

`reviews` table:
- `id uuid pk default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `author_name text not null` (snapshot at submit time)
- `rating int not null check (rating between 1 and 5)`
- `body text not null check (char_length(body) between 10 and 600)`
- `created_at timestamptz default now()`
- `status text not null default 'published'` — kept simple; admins can later flip to 'hidden'

Grants + RLS:
- `GRANT SELECT ON public.reviews TO anon, authenticated;`
- `GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;`
- `GRANT ALL ON public.reviews TO service_role;`
- Policy: anyone may `SELECT` rows where `status = 'published'`.
- Policy: authenticated users may `INSERT` rows where `user_id = auth.uid()`.
- Policy: authenticated users may `UPDATE`/`DELETE` their own row.
- Policy: admins (via existing `has_role(auth.uid(),'admin')`) may do anything.

### Server functions (`src/lib/reviews.functions.ts`)

- `listReviews()` — public, uses the server publishable client (no bearer), returns latest 100 published reviews with `{ id, author_name, rating, body, created_at }`.
- `submitReview({ rating, body })` — uses `requireSupabaseAuth`. Pulls display name from `context.claims` (email/full_name fallback), inserts row, throws on validation failure. Returns the new review.
- `deleteMyReview({ id })` — `requireSupabaseAuth`, deletes only own row.

### Route redesign: `src/routes/reviews.tsx`

Sections, keeping current hero styling:
1. Existing hero header (unchanged copy/styling).
2. **Aggregate strip**: average rating (1 decimal) + total count, computed from loader data.
3. **Write a review** card:
   - Signed in → 5-star picker, textarea (10–600 chars, live counter), Submit button. On success, optimistically prepend.
   - Signed out → cream-bordered CTA card: "Sign in to share your experience" linking to `/auth?next=/reviews`.
   - One review per session shows a subtle "Thanks!" toast (sonner already present).
4. **Reviews grid**: 2-column on desktop, 1-column on mobile, cards with stars, name initial avatar, body, relative date. Empty state preserved when zero.
5. Owner's own review shows a small "Delete" link.

Data loading uses the project's standard TanStack Query loader pattern (`ensureQueryData` + `useSuspenseQuery`). Public loader calls the public `listReviews` server fn (no bearer required).

### Files touched
- `supabase/migrations/<new>.sql` (table + grants + RLS)
- `src/lib/reviews.functions.ts` (new)
- `src/routes/reviews.tsx` (redesign)
- `src/components/StarRating.tsx` (small reusable display + input)

No design system changes, no new dependencies, no admin moderation UI in this pass.