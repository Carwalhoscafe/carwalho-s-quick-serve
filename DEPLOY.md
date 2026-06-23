# Deploying to Cloudflare Workers

This app is a TanStack Start full-stack project (SSR + server functions).
It targets the Cloudflare **Workers** runtime — not Cloudflare Pages.

## One-time setup

1. Push the repo to GitHub (via Lovable's `+` → GitHub → Connect project).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**.
3. Pick your GitHub repo.

## Cloudflare build settings

| Setting | Value |
| --- | --- |
| **Build command** | `npm install && npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Build output directory** | `.output` |
| **Root directory** | `/` (repo root) |
| **Compatibility flags** | `nodejs_compat` (already set in `wrangler.toml`) |

## Environment variables

None required for the current app. If you later enable Lovable Cloud / Supabase,
add these as Worker secrets via `npx wrangler secret put <NAME>`:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only if you use admin/server-side writes)

## Local manual deploy

```bash
npm install
npm run build
npx wrangler deploy
```

The Vite build writes the Cloudflare Worker bundle to `.output/server/index.mjs`
and static assets to `.output/public`. `wrangler.toml` wires both into the Worker.
