import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://carwalhoscafe.in";
const PATHS = [
  "/", "/menu", "/about", "/reviews", "/contact",
  "/privacy", "/terms", "/cookies", "/disclaimer",
  "/refund", "/returns", "/cancellation", "/shipping",
  "/payment", "/acceptable-use", "/community",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const urls = PATHS.map(p => `  <url><loc>${BASE}${p}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.7"}</priority></url>`).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          status: 200,
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
