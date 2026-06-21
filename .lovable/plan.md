## Diagnosis

All 11 policy route files exist under `src/routes/` (privacy, terms, cookies, disclaimer, refund, returns, cancellation, shipping, payment, acceptable-use, community) and they are correctly registered in `src/routeTree.gen.ts` (verified `PrivacyRoute` etc. are present with `path: '/privacy'`).

The 404 you saw is almost certainly a stale preview — the route tree was regenerated after your browser already had the old page loaded, so the client router didn't know about the new routes when you clicked.

## Plan

1. Restart the Vite dev server so the preview reloads with the freshly generated route tree.
2. Open `/privacy` in the preview to confirm the page renders.
3. If any route still 404s, inspect that specific route file for a `createFileRoute` path mismatch and fix it.

No code changes are expected — just a server refresh and verification.