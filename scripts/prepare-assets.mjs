#!/usr/bin/env node
// Downloads all Lovable CDN assets referenced by src/**/*.asset.json
// into public/__l5e/assets-v1/<id>/<filename> so they ship as static
// files with the Cloudflare Workers [assets] binding.
import { readdir, readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public", "__l5e", "assets-v1");

// Lovable preview origin — assets are public and served from here.
const ORIGIN =
  process.env.LOVABLE_ASSET_ORIGIN ||
  "https://id-preview--5e469429-f6d3-4b49-a20b-6c65ed347541.lovable.app";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p)));
    else if (entry.name.endsWith(".asset.json")) out.push(p);
  }
  return out;
}

async function main() {
  const files = await walk(SRC);
  await mkdir(OUT, { recursive: true });
  let downloaded = 0;
  let skipped = 0;
  for (const f of files) {
    const meta = JSON.parse(await readFile(f, "utf8"));
    if (!meta.asset_id || !meta.original_filename) continue;
    const dir = path.join(OUT, meta.asset_id);
    const dest = path.join(dir, meta.original_filename);
    if (existsSync(dest)) {
      const s = await stat(dest);
      if (meta.size && s.size === meta.size) {
        skipped++;
        continue;
      }
    }
    const url = `${ORIGIN}${meta.url}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dir, { recursive: true });
    await writeFile(dest, buf);
    downloaded++;
    console.log(`  ✓ ${meta.original_filename} (${buf.length} bytes)`);

    // Mirror favicon assets to stable /public paths so they're reachable
    // from /favicon.svg and /favicon.png on any host.
    const base = path.basename(f, ".asset.json"); // e.g. "favicon.svg"
    if (base.startsWith("favicon.")) {
      await writeFile(path.join(ROOT, "public", base), buf);
      console.log(`  ✓ mirrored → public/${base}`);
    }
  }
  console.log(`Assets ready: ${downloaded} downloaded, ${skipped} cached.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
