## Goals

1. Swap the **Pondicherry (Large)** product image for a real coconut photo.
2. Audit every image reference in the project and confirm it works on the Cloudflare Workers deployment.

## What I found in the audit (already done)

All images in this project are served from Lovable's CDN as `.asset.json` pointers (URLs like `/__l5e/assets-v1/{id}/{file}`). These URLs are absolute and host-agnostic — they work identically on local dev, Lovable preview, and Cloudflare Workers. There are **no `public/` images, no relative file paths, no case-sensitive filename risks, and no broken imports** in the codebase.

Current asset inventory (all wired up correctly):

| Asset | Used by |
|---|---|
| `carwalhos-hero.png` | Hero background (`src/routes/index.tsx`) |
| `carwalhos-logo-white.png` | Header on hero |
| `carwalhos-logo-black.png` | Header on light pages |
| `carwalhos-logo-green.png` | Footer |
| `favicon.svg` / `favicon.png` | `__root.tsx` `<link rel="icon">` |
| `product-sugarcane.jpg` | Sugarcane product |
| `product-tender-coconut-styled.jpg` | Pondicherry (Regular) |
| `product-coconut-pondicherry-large.jpg` | Pondicherry (Large) — **to be replaced** |
| `product-coconut-pollachi.jpg` | Pollachi product |

Nothing is broken — there are no missing references to fix. The "Cloudflare image" concern doesn't apply here because images are not bundled into the Worker; they're fetched from the Lovable CDN at runtime.

## Changes I will make

1. Generate a **real photograph** of a large Pondicherry tender coconut (whole coconut, natural green-orange husk, clean background) and upload it to the CDN.
2. Replace `src/assets/product-coconut-pondicherry-large.jpg.asset.json` with the new pointer.
3. Run a final `grep` pass to confirm no stale references remain.

No UI, layout, color, font, routing, Supabase, WhatsApp, or AI code will be touched.

## Deployment note

GitHub sync happens automatically through Lovable's GitHub integration — every saved change pushes to your connected repo, which then triggers your Cloudflare Workers build. I don't need to (and can't) run `git push` manually.

## Deliverable summary I'll provide after the build

- The one asset path that changed (Pondicherry Large).
- Confirmation that the production build succeeds and all image URLs resolve.
