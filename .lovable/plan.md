# Redesign Section 2 (Freshly Prepared / Event & Office / Advance Booking / Healthy Hydration) using the Impeccable design language

## What you uploaded
`impeccable-main` is a design system called **Neo Kinpaku** — warm black lacquer surfaces, kinpaku-gold as the sole brand accent, verdigris-patina as a rare secondary, hairline gold rules, thin display type (Alumni Sans light), mono eyebrow labels, and a very restrained, editorial feel. Restraint in chrome, brilliance in texture.

The current section 2 on the site is a plain 4-column strip with a lucide icon, small heading, and body text on `bg-card/30`. Functional but flat — nothing about it says "hand-pressed daily".

## The redesign (scope: section 2 only, first pass)

Rebuild the section as a **four-panel kinpaku pillar grid** that sits on a lacquer band inside the existing warm-teal site (the rest of the brand stays intact this pass). Each panel is a tall card, not a horizontal strip item.

Anatomy of one panel:

```text
┌───────────────────────────────┐
│ 01 ── FRESHNESS               │  <- mono eyebrow: index + kicker in gold
│                               │
│                               │
│      Freshly                  │  <- display headline, thin, two-line
│      Prepared.                │
│                               │
│ ─────────────────────────     │  <- gold hairline rule
│                               │
│ Made fresh daily from         │  <- body text, warm-neutral
│ premium tender coconuts       │
│ and hand-selected sugarcane.  │
│                               │
│                    ↗          │  <- small gold arrow glyph, bottom-right
└───────────────────────────────┘
```

- Section background: a **lacquer band** — very dark warm-black (`oklch(7% 0.006 95)`), full-bleed, top and bottom edged with a 1px kinpaku-gold hairline.
- Section header: small mono eyebrow "THE PROMISE" in gold, then a thin display line "Four reasons the jug tastes like the field."
- Panel background: `raised-lacquer` (`oklch(11% 0.006 95)`), 1px `gold-hairline` border, no shadow. On hover the border shifts to `gold-hairline-strong` and a faint gold glint sweeps once across the top edge (single subtle animation, not scattered micro-interactions).
- Index tag: `01 ── FRESHNESS` in mono, 0.7rem, letter-spacing 0.18em, kinpaku-gold.
- Headline: Alumni Sans, weight 100, ~2.4rem, near-white (`champagne`), two lines forced so all four cards align.
- Divider: gold hairline, 40% width, left-aligned.
- Body: Albert Sans, warm-neutral, 1.02rem, generous line-height.
- Corner glyph: small ↗ or a hand-drawn kinpaku leaf mark (SVG, gold), bottom-right, low opacity.
- Icons: replaced. Lucide's generic Sparkles/MapPin/Clock/Leaf are dropped in favor of the numeric index + kicker system, which is more in Impeccable's voice. (If you want an icon back we can add tiny hairline gold glyphs above the headline instead.)
- Grid: 4 columns desktop, 2 columns tablet, 1 column mobile. Panels are taller than wide (roughly 3:4).

Content mapping — copy stays, kickers added:

1. `01 ── FRESHNESS` → **Freshly Prepared.** — Made fresh daily from premium tender coconuts and hand-selected sugarcane.
2. `02 ── DELIVERY` → **Event & Office.** — Reliable delivery for offices, meetings, schools, events, and community gatherings.
3. `03 ── SCHEDULE` → **Book in Advance.** — Schedule your delivery ahead and receive fresh drinks exactly when needed.
4. `04 ── NATURE` → **Healthy Hydration.** — A natural alternative to soft drinks, packed with freshness and goodness.

## Technical details

- New tokens in `src/styles.css` (scoped, additive — not replacing the cafe palette):
  - `--lacquer: oklch(7% 0.006 95);`
  - `--lacquer-raised: oklch(11% 0.006 95);`
  - `--kinpaku: oklch(84% 0.19 80.46);`
  - `--kinpaku-rule: oklch(78% 0 0 / 0.16);`
  - `--kinpaku-rule-strong: oklch(74% 0.09 82 / 0.6);`
  - `--champagne: oklch(91% 0 0);`
  - `--font-impeccable-display: "Alumni Sans", "Cormorant Garamond", serif;`
  - `--font-impeccable-body: "Albert Sans", "Work Sans", sans-serif;`
  - `--font-impeccable-mono: ui-monospace, "SFMono-Regular", monospace;`
- Load Alumni Sans (100, 300) and Albert Sans (400, 500) via `<link>` in `src/routes/__root.tsx` — never `@import` a remote font URL in Tailwind v4.
- Edit **only** `src/routes/index.tsx`: replace the current `valueProps` block (`<section className="border-y border-border/60 bg-card/30">…`) with a new `<section id="promise">` using the tokens above.
- Component stays inline in `index.tsx` (no new file for a single section). Tailwind arbitrary values reference the new CSS vars (`bg-[var(--lacquer)]`, `text-[var(--kinpaku)]`, etc.).
- One subtle hover animation only: a CSS keyframe `sheen` that translates a thin gold gradient across the panel top border once on hover. No stagger, no parallax.
- Full-bleed band achieved with `mx-[calc(50%-50vw)] w-screen` inside the current max-width layout.

## What is explicitly NOT in this plan

- Hero, menu grid, how-it-works, bulk CTA, footer — untouched.
- Global colour tokens for the rest of the site — untouched (the cafe stays warm teal/amber). The lacquer band is a deliberate contrast island.
- Auth, checkout, OAuth, location picker — untouched.
- No new routes, no schema changes.

## If you want to go further

Say the word and I'll follow up with a plan for one of:
- **Brand-wide pivot** to Impeccable (dark lacquer replaces teal across every page — bigger job, ~1 day of edits).
- **Sibling redesign of "How it works"** in the same lacquer language, so section 2 and section 4 read as a matched pair.
- **Menu cards** re-skinned with kinpaku hairlines and mono price labels.

## Verification before I hand it back

- Playwright screenshot of the homepage at 1280×1800, confirming: gold hairline top and bottom of the band, four aligned panels, headlines on the same baseline, hover sheen fires once.
- Mobile screenshot at 390 wide — panels stack, index tags still legible.
- Lighthouse quick pass to confirm the two new font families don't blow LCP (both are loaded `display=swap`, subset latin).
