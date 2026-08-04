#!/usr/bin/env node
/**
 * verify-seo.mjs — SEO harness. Checks the BUILT SITE (out/), not the source.
 *
 * Why it checks output: the canonical/hreflang bug that hid 640 URLs from Google was
 * invisible in the source — app/[locale]/layout.jsx looked correct, and Next.js silently
 * inherited its `alternates` into every child page. Only the emitted HTML showed it.
 * So this verifier reads what actually ships.
 *
 * Hard errors (exit 1 — fails `npm run build`):
 *   [E] canonical missing / not self-referencing (the 640-URL bug)
 *   [E] hreflang set incomplete, or an alternate points at a different path
 *   [E] hreflang target not built (would send Google to a 404)
 *   [E] sitemap <-> built pages mismatch (missing or ghost URLs)
 *   [E] <title> or <meta name="description"> missing/empty
 *   [E] duplicate <title> within one locale (template not filled in)
 *   [E] locale home title identical to English (metadata translation regressed)
 *   [E] <html lang> missing/wrong, or RTL locale without dir="rtl"
 *   [E] og:image / twitter:image referencing a file that isn't in the build
 *   [E] malformed JSON-LD
 *   [E] robots.txt without a sitemap line
 * Warnings (exit 0):
 *   [W] no og:image        [W] title/description length outside the usual SERP window
 *   [W] title identical to English on a non-en page (untranslated content, not a code bug)
 *
 * Usage:  node scripts/verify-seo.mjs            (after a build)
 *         npm run verify:seo
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const SITE = "https://ktriphub.com";
const REF = "en";
const RTL = new Set(["ar"]);
// Locales come from lib/i18n.js so this file never needs updating when a language is added.
const LOCALES = (() => {
  const src = fs.readFileSync(path.join(ROOT, "lib", "i18n.js"), "utf8");
  const m = src.match(/export\s+const\s+locales\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([\w-]+)["'`]/g)].map((x) => x[1]) : [];
})();

if (!fs.existsSync(OUT)) {
  console.error("FATAL: out/ not found — run `npm run build` first.");
  process.exit(2);
}
if (!LOCALES.length) {
  console.error("FATAL: could not read `export const locales` from lib/i18n.js");
  process.exit(2);
}

// ---------- collect built pages ----------
/** out/en/plan/transit/index.html -> { url: "https://…/en/plan/transit/", locale, rel: "plan/transit" } */
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === "index.html") acc.push(p);
  }
  return acc;
}
const pages = walk(OUT)
  .map((file) => {
    const rel = path.relative(OUT, path.dirname(file)).split(path.sep).join("/");
    const [locale, ...rest] = rel.split("/");
    return { file, rel, locale, path: rest.join("/"), url: `${SITE}/${rel}/` };
  })
  .filter((p) => LOCALES.includes(p.locale)); // skip 404/ and other non-locale output

const builtUrls = new Set(pages.map((p) => p.url));

// ---------- tiny HTML head helpers (zero deps, same spirit as verify-i18n) ----------
const head = (html) => html.slice(0, html.indexOf("</head>") + 1 || html.length);
const attr = (tag, name) => (tag.match(new RegExp(`${name}="([^"]*)"`, "i")) || [, null])[1];
const decode = (s) =>
  s == null ? s : s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

function parseHead(html) {
  const h = head(html);
  const links = h.match(/<link\b[^>]*>/gi) || [];
  const metas = h.match(/<meta\b[^>]*>/gi) || [];
  const meta = (key, val) => {
    const tag = metas.find((t) => (attr(t, key) || "").toLowerCase() === val);
    return tag ? decode(attr(tag, "content")) : null;
  };
  return {
    lang: attr(html.match(/<html\b[^>]*>/i)?.[0] || "", "lang"),
    dir: attr(html.match(/<html\b[^>]*>/i)?.[0] || "", "dir"),
    title: decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [, null])[1]),
    description: meta("name", "description"),
    canonical: links.filter((t) => (attr(t, "rel") || "") === "canonical").map((t) => attr(t, "href")),
    alternates: links
      .filter((t) => (attr(t, "rel") || "") === "alternate" && /hreflang/i.test(t))
      .map((t) => ({ lang: attr(t, "hreflang") || attr(t, "hrefLang"), href: attr(t, "href") })),
    ogImage: meta("property", "og:image"),
    twImage: meta("name", "twitter:image"),
    ogTitle: meta("property", "og:title"),
    ld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]),
  };
}

// ---------- checks ----------
const errors = [];
const warnings = [];
const E = (page, msg) => errors.push(`${page}: ${msg}`);
const W = (page, msg) => warnings.push(`${page}: ${msg}`);

const titlesByLocale = new Map(); // locale -> Map(title -> [rel])
const refTitles = new Map(); // path -> en title
const parsed = new Map();

for (const p of pages) {
  const h = parseHead(fs.readFileSync(p.file, "utf8"));
  parsed.set(p.rel, h);
  if (p.locale === REF) refTitles.set(p.path, h.title);
}

for (const p of pages) {
  const h = parsed.get(p.rel);
  const id = `/${p.rel}/`;

  // --- canonical: exactly one, and it must point at THIS page ---
  if (h.canonical.length === 0) E(id, "no <link rel=canonical>");
  else if (h.canonical.length > 1) E(id, `${h.canonical.length} canonical tags (must be exactly 1)`);
  else if (h.canonical[0] !== p.url) E(id, `canonical points elsewhere: ${h.canonical[0]} (expected ${p.url})`);

  // --- hreflang: every locale + x-default, all on the SAME path, all actually built ---
  const byLang = new Map(h.alternates.map((a) => [a.lang, a.href]));
  if (h.alternates.length === 0) {
    E(id, "no hreflang alternates");
  } else {
    for (const l of LOCALES) {
      const href = byLang.get(l);
      if (!href) { E(id, `hreflang missing: ${l}`); continue; }
      const expected = `${SITE}/${l}/${p.path ? p.path + "/" : ""}`;
      if (href !== expected) E(id, `hreflang ${l} -> ${href} (expected ${expected})`);
      else if (!builtUrls.has(href)) E(id, `hreflang ${l} target not built: ${href}`);
    }
    const xd = byLang.get("x-default");
    if (!xd) E(id, "hreflang missing: x-default");
    else if (xd !== `${SITE}/${REF}/${p.path ? p.path + "/" : ""}`) E(id, `x-default -> ${xd}`);
    if (byLang.get(p.locale) !== p.url) E(id, "hreflang set does not include this page (self-reference)");
  }

  // --- title / description ---
  if (!h.title || !h.title.trim()) E(id, "empty <title>");
  else {
    if (h.title.length > 70) W(id, `title ${h.title.length} chars (SERP truncates ~60)`);
    const seen = titlesByLocale.get(p.locale) || new Map();
    seen.set(h.title, [...(seen.get(h.title) || []), p.path]);
    titlesByLocale.set(p.locale, seen);
  }
  if (!h.description || !h.description.trim()) E(id, "no meta description");
  else if (h.description.length > 200) W(id, `description ${h.description.length} chars`);

  // --- localization regressions (English metadata leaking into other locales) ---
  if (p.locale !== REF && h.title && refTitles.get(p.path) === h.title) {
    if (p.path === "") E(id, "locale home <title> is identical to English (meta translation lost)");
    else W(id, "title identical to English (content not translated yet)");
  }

  // --- <html lang> / dir ---
  if (h.lang !== p.locale) E(id, `<html lang="${h.lang}"> should be "${p.locale}"`);
  if (RTL.has(p.locale) && h.dir !== "rtl") E(id, `RTL locale without dir="rtl" (got "${h.dir}")`);

  // --- images must exist in the build (a 404 og:image kills the share card) ---
  for (const [label, src] of [["og:image", h.ogImage], ["twitter:image", h.twImage]]) {
    if (!src) continue;
    const local = src.startsWith(SITE) ? src.slice(SITE.length) : src.startsWith("/") ? src : null;
    if (local && !fs.existsSync(path.join(OUT, local.split("?")[0]))) E(id, `${label} not in build: ${src}`);
  }
  if (!h.ogImage) W(id, "no og:image (link shares render without a picture)");

  // --- JSON-LD must parse and be typed ---
  for (const raw of h.ld) {
    try {
      const node = JSON.parse(raw.replace(/\\u003c/g, "<"));
      if (!node["@context"] || !node["@type"]) E(id, "JSON-LD without @context/@type");
    } catch {
      E(id, "malformed JSON-LD");
    }
  }
}

// --- duplicate titles inside one locale ---
for (const [loc, seen] of titlesByLocale) {
  for (const [title, paths] of seen) {
    if (paths.length > 1) E(`/${loc}/`, `duplicate <title> on ${paths.length} pages ("${title}"): ${paths.slice(0, 4).join(", ")}${paths.length > 4 ? " …" : ""}`);
  }
}

// --- sitemap <-> build ---
const sitemapFile = path.join(OUT, "sitemap.xml");
let sitemapUrls = new Set();
if (!fs.existsSync(sitemapFile)) {
  errors.push("sitemap.xml: not generated");
} else {
  const xml = fs.readFileSync(sitemapFile, "utf8");
  sitemapUrls = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  const missing = [...builtUrls].filter((u) => !sitemapUrls.has(u));
  const ghosts = [...sitemapUrls].filter((u) => !builtUrls.has(u));
  if (missing.length) errors.push(`sitemap.xml: ${missing.length} built page(s) not listed, e.g. ${missing.slice(0, 3).join(", ")}`);
  if (ghosts.length) errors.push(`sitemap.xml: ${ghosts.length} listed URL(s) not built, e.g. ${ghosts.slice(0, 3).join(", ")}`);
}

// --- robots.txt ---
const robotsFile = path.join(OUT, "robots.txt");
if (!fs.existsSync(robotsFile)) errors.push("robots.txt: not generated");
else if (!/^\s*Sitemap:\s*\S+/im.test(fs.readFileSync(robotsFile, "utf8"))) errors.push("robots.txt: no Sitemap: line");

// ---------- report ----------
const group = (list) => {
  const byKind = new Map();
  for (const line of list) {
    const kind = line
      .replace(/^[^:]+:\s*/, "")
      .replace(/["'][^"']*["']/g, "…")
      .replace(/https?:\/\/\S+/g, "…")
      .replace(/\b\d+\b/g, "N") // so "title 72 chars"/"title 84 chars" collapse into one row
      .slice(0, 60);
    byKind.set(kind, (byKind.get(kind) || 0) + 1);
  }
  return [...byKind.entries()].sort((a, b) => b[1] - a[1]);
};

console.log(`\n  SEO verification · ${path.basename(ROOT)}`);
console.log(`  ${pages.length} pages · ${LOCALES.length} locales · ${sitemapUrls.size} sitemap URLs\n`);
console.log(`  errors: ${errors.length}   warnings: ${warnings.length}`);

if (errors.length) {
  console.log("\n  ── errors ──");
  for (const [kind, n] of group(errors)) console.log(`   [E] ${kind}${n > 1 ? `  ×${n}` : ""}`);
  console.log("\n  first 10:");
  errors.slice(0, 10).forEach((e) => console.log(`   · ${e}`));
}
if (warnings.length) {
  console.log("\n  ── warnings ──");
  for (const [kind, n] of group(warnings)) console.log(`   [W] ${kind}${n > 1 ? `  ×${n}` : ""}`);
  // Untranslated metadata is a content backlog, so show WHERE it is, not just how much.
  const untranslated = warnings.filter((w) => w.includes("identical to English"));
  if (untranslated.length) {
    const byLocale = new Map();
    for (const w of untranslated) {
      const loc = w.split("/")[1];
      byLocale.set(loc, (byLocale.get(loc) || 0) + 1);
    }
    console.log(
      "   └ untranslated titles by locale: " +
        [...byLocale.entries()].sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l}:${n}`).join(" ")
    );
  }
}
console.log(`\n  Result: ${errors.length === 0 ? "PASS ✓" : "FAIL ✗ (" + errors.length + " errors)"}\n`);
process.exit(errors.length === 0 ? 0 : 1);
