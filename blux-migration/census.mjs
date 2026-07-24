#!/usr/bin/env node
/**
 * Blux export census — v1, schema-agnostic.
 * Usage: node census.mjs <dir>   where <dir> contains one folder per exported site.
 *
 * The Blux site-data JSON schema is unknown until the first export lands, so this
 * walks every .json in each site folder and tallies:
 *   - values of keys that look like block-type discriminators (type, blockType,
 *     block_type, template, component, kind)
 *   - media inventory by extension (count + bytes)
 *   - a pairwise Jaccard similarity matrix of block-type sets across sites
 *     (the batch-vs-bespoke signal for the 6 Worthe properties)
 * Refine into a typed parser once the real schema is visible (GAPS.md #12).
 */
import { readdirSync, readFileSync, statSync } from "fs";
import { join, extname } from "path";

const TYPE_KEYS = new Set([
  "type",
  "blockType",
  "block_type",
  "template",
  "component",
  "kind",
]);
const MEDIA_EXT = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".webm",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".ico",
  ".avif",
]);

const root = process.argv[2];
if (!root) {
  console.error("usage: node census.mjs <dir-with-one-folder-per-site>");
  process.exit(2);
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield { path: p, size: st.size };
  }
}

function tallyTypes(node, tally) {
  if (Array.isArray(node)) {
    for (const item of node) tallyTypes(item, tally);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (TYPE_KEYS.has(k) && typeof v === "string" && v.length < 80) {
        tally.set(v, (tally.get(v) ?? 0) + 1);
      }
      tallyTypes(v, tally);
    }
  }
}

const sites = readdirSync(root).filter((d) =>
  statSync(join(root, d)).isDirectory(),
);
if (sites.length === 0) {
  console.error(`no site folders found under ${root}`);
  process.exit(1);
}

const perSite = new Map(); // site -> { types: Map, media: Map(ext -> {n, bytes}), jsonFiles, htmlFiles }
for (const site of sites) {
  const types = new Map();
  const media = new Map();
  let jsonFiles = 0;
  let htmlFiles = 0;
  for (const f of walk(join(root, site))) {
    const ext = extname(f.path).toLowerCase();
    if (ext === ".json") {
      jsonFiles++;
      try {
        tallyTypes(JSON.parse(readFileSync(f.path, "utf8")), types);
      } catch {
        console.error(`  (unparseable JSON skipped: ${f.path})`);
      }
    } else if (ext === ".html" || ext === ".htm") htmlFiles++;
    else if (MEDIA_EXT.has(ext)) {
      const m = media.get(ext) ?? { n: 0, bytes: 0 };
      m.n++;
      m.bytes += f.size;
      media.set(ext, m);
    }
  }
  perSite.set(site, { types, media, jsonFiles, htmlFiles });
}

// --- Per-site report
for (const [site, d] of perSite) {
  console.log(`\n=== ${site} — ${d.jsonFiles} json, ${d.htmlFiles} html`);
  const sorted = [...d.types.entries()].sort((a, b) => b[1] - a[1]);
  console.log(
    sorted.length
      ? sorted.map(([t, n]) => `  ${String(n).padStart(4)}  ${t}`).join("\n")
      : "  (no type-like keys found — inspect the JSON shape by hand)",
  );
  const mediaTotal = [...d.media.values()].reduce((s, m) => s + m.bytes, 0);
  console.log(
    `  media: ${[...d.media.entries()].map(([e, m]) => `${m.n}${e}`).join(", ")} (${(mediaTotal / 1e6).toFixed(1)} MB)`,
  );
}

// --- Cross-site block-type union + similarity matrix
const allTypes = new Map();
for (const [site, d] of perSite)
  for (const t of d.types.keys()) {
    allTypes.set(t, (allTypes.get(t) ?? new Set()).add(site));
  }
console.log(
  `\n=== Block-type union (${allTypes.size} types) — sites using each:`,
);
for (const [t, s] of [...allTypes.entries()].sort(
  (a, b) => b[1].size - a[1].size,
)) {
  console.log(`  ${String(s.size).padStart(2)}/${sites.length}  ${t}`);
}

console.log("\n=== Pairwise similarity (Jaccard of block-type sets):");
for (let i = 0; i < sites.length; i++) {
  for (let j = i + 1; j < sites.length; j++) {
    const a = new Set(perSite.get(sites[i]).types.keys());
    const b = new Set(perSite.get(sites[j]).types.keys());
    if (a.size === 0 && b.size === 0) continue;
    const inter = [...a].filter((t) => b.has(t)).length;
    const union = new Set([...a, ...b]).size;
    console.log(`  ${(inter / union).toFixed(2)}  ${sites[i]} × ${sites[j]}`);
  }
}
