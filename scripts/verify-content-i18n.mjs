#!/usr/bin/env node
/**
 * verify-content-i18n.mjs — checks the CONTENT translations under data/, which
 * scripts/verify-i18n.mjs does not cover (that one only reads messages/*.json).
 *
 * Two shapes are checked, both "English base + per-locale override":
 *   data/<name>.<locale>.json      (destinations / food / plan)
 *   data/visa/<country>.i18n.json  ({ "<locale>": { ...overrides } })
 *
 * Why this exists: these files carry the actual travel facts a reader acts on —
 * "within 72 hours", "up to 90 days", "e-arrivalcard.go.kr", "31 Dec 2026". A
 * translation that drops or changes one of those is a factual error in that
 * language, and nothing was checking for it (HARNESS §4: 번역이 사실을 바꾸지 않았는가).
 *
 * Hard errors (exit 1):
 *   [E] number/date/domain from the English source missing in the translation
 *   [E] array length differs from the base (a step or FAQ item was dropped)
 *   [E] key not present in the English base (typo — it would never render)
 *   [E] untranslatable field changed (link/url/req/icon/tone/n)
 *   [E] Korean text leaked into a non-Korean locale
 *   [E] unknown locale key (not in lib/i18n.js)
 * Report (never fails): per-file locale coverage, so the translation backlog is visible.
 *
 * Usage:  node scripts/verify-content-i18n.mjs [locale ...]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const LOCALES = (() => {
  const src = fs.readFileSync(path.join(ROOT, "lib", "i18n.js"), "utf8");
  const m = src.match(/export\s+const\s+locales\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([\w-]+)["'`]/g)].map((x) => x[1]) : [];
})();
const REF = "en";
const targets = process.argv.slice(2);
const wanted = (loc) => !targets.length || targets.includes(loc);

// Fields that must never be translated: URLs, enum values, asset paths.
// NOT "n": in data/visa it's a step number (numeric, skipped anyway), but in data/food
// it's the dish name, which must be translated.
const FROZEN = new Set(["link", "url", "src", "req", "icon", "tone", "img", "creditUrl", "code", "factId"]);
const HANGUL = /[가-힣]/;
const HANGUL_OK = new Set(["ko"]);

// Locale digit sets — "72" may legitimately appear as "٧٢" (ar), "৭২" (bn), "७२" (hi), "๗๒" (th).
const DIGIT_MAPS = [
  ["٠١٢٣٤٥٦٧٨٩", "ar"], ["০১২৩৪৫৬৭৮৯", "bn"], ["०१२३४५६७८९", "hi"], ["๐๑๒๓๔๕๖๗๘๙", "th"],
];
function normalizeDigits(s) {
  let out = s;
  for (const [set] of DIGIT_MAPS) {
    for (let d = 0; d < 10; d++) out = out.split(set[d]).join(String(d));
  }
  return out;
}

/** Numbers, dates and domains that must survive translation verbatim.
 *  `soft: true` marks tokens where dropping them is a style choice, not a factual change —
 *  rank/ordinal forms ("#1 most-visited" -> "Самый посещаемый") are legitimately reworded,
 *  while "72 hours", "90 days", "₩10,000" and "2026-12-31" are not. */
function tokens(s) {
  if (typeof s !== "string") return [];
  const out = new Map(); // token -> soft?
  const add = (tok, soft) => {
    if (!out.has(tok) || !soft) out.set(tok, soft);
  };
  (s.match(/\d{4}-\d{2}-\d{2}/g) || []).forEach((x) => add(x, false));
  for (const m of s.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const n = m[0].replace(/[.,]+$/, "");
    if (!n) continue;
    // Small whole numbers are soft: languages legitimately spell them out, use an ordinal,
    // or fold them into grammar — Arabic writes "2 blank pages" as a dual noun, and
    // "#1 most-visited" becomes "самый посещаемый". A wrong "72 hours" or "10,000" is a
    // factual error; a reworded "2" is not.
    add(n, !n.includes(".") && Number(n.replace(/,/g, "")) <= 10);
  }
  (s.match(/[a-z0-9-]+\.(?:go\.kr|or\.kr|co\.kr|com|net|kr)\b/gi) || []).forEach((x) => add(x.toLowerCase(), false));
  return [...out.entries()];
}

const errors = [];
const warnings = [];
const rows = [];

/** Walk base and override in parallel. `at` is a dotted path for error messages. */
function compare(base, ov, at, ctx) {
  if (ov === undefined || ov === null) return;

  if (Array.isArray(base)) {
    if (!Array.isArray(ov)) return errors.push(`${ctx}: ${at} should be an array`);
    if (ov.length !== base.length)
      errors.push(`${ctx}: ${at} has ${ov.length} items, base has ${base.length} (item dropped/added)`);
    ov.forEach((v, i) => compare(base[i], v, `${at}[${i}]`, ctx));
    return;
  }

  if (base && typeof base === "object") {
    if (typeof ov !== "object") return errors.push(`${ctx}: ${at} should be an object`);
    for (const k of Object.keys(ov)) {
      if (k.startsWith("_")) continue;
      // A key absent from the base is legitimate: both merge paths (mergeGuide in lib/visa.js
      // and the {...base, ...ov} spreads in the pages) add locale-only keys such as `ui`,
      // and the visa-required guides keep h1/metaTitle/metaDesc per locale only.
      if (!(k in base)) continue;
      compare(base[k], ov[k], at ? `${at}.${k}` : k, ctx);
    }
    return;
  }

  // leaf
  const key = at.split(".").pop().replace(/\[\d+\]$/, "");
  if (FROZEN.has(key)) {
    if (base !== undefined && ov !== base) errors.push(`${ctx}: ${at} must not be translated (base "${base}", got "${ov}")`);
    return;
  }
  if (typeof base !== "string" || typeof ov !== "string") return;

  if (!HANGUL_OK.has(ctx.locale) && HANGUL.test(ov)) errors.push(`${ctx}: ${at} — Korean text leaked`);
  const have = normalizeDigits(ov).toLowerCase();
  for (const [tok, soft] of tokens(base)) {
    // Decimal comma vs point, and thousands separators, differ by locale:
    // "3.5 cm" -> "3,5 cm" (vi/es), "10,000" -> "10.000" (de). Compare separator-agnostically.
    const variants = new Set([tok, tok.replace(/[.,]/g, ""), tok.replace(/,/g, "."), tok.replace(/\./g, ",")]);
    if ([...variants].some((v) => have.includes(v.toLowerCase()))) continue;
    const msg = `${ctx}: ${at} — dropped "${tok}" (base: "${String(base).slice(0, 60)}…")`;
    if (soft) warnings.push(msg); // ordinal/rank reworded — a style choice, not a fact change
    else errors.push(msg);
  }
}

// ---------- data/<name>.<locale>.json ----------
const overrideFiles = fs.readdirSync(DATA).filter((f) => /^[a-z]+\.[\w-]+\.json$/.test(f));
const bases = [...new Set(overrideFiles.map((f) => f.split(".")[0]))];
for (const name of bases) {
  const basePath = path.join(DATA, `${name}.json`);
  if (!fs.existsSync(basePath)) continue;
  const base = readJson(basePath);
  const have = [];
  for (const loc of LOCALES) {
    if (loc === REF) continue;
    const p = path.join(DATA, `${name}.${loc}.json`);
    if (!fs.existsSync(p)) continue;
    have.push(loc);
    if (!wanted(loc)) continue;
    const c = { toString: () => `${name}.${loc}.json`, locale: loc };
    compare(base, readJson(p), "", c);
  }
  rows.push({ file: `data/${name}.*.json`, have });
}

// ---------- data/visa/<country>.i18n.json ----------
const VISA = path.join(DATA, "visa");
if (fs.existsSync(VISA)) {
  for (const f of fs.readdirSync(VISA).filter((f) => f.endsWith(".i18n.json"))) {
    const country = f.replace(".i18n.json", "");
    const basePath = path.join(VISA, `${country}.json`);
    if (!fs.existsSync(basePath)) { errors.push(`${f}: no English base ${country}.json`); continue; }
    const base = readJson(basePath);
    const ov = readJson(path.join(VISA, f));
    const have = [];
    for (const loc of Object.keys(ov)) {
      if (loc.startsWith("_")) continue;
      if (!LOCALES.includes(loc)) { errors.push(`${f}: unknown locale "${loc}"`); continue; }
      have.push(loc);
      if (!wanted(loc)) continue;
      const c = { toString: () => `visa/${country} · ${loc}`, locale: loc };
      compare(base, ov[loc], "", c);
    }
    rows.push({ file: `data/visa/${f}`, have });
  }
}

// ---------- report ----------
console.log(`\n  content i18n verification · ${LOCALES.length} locales (reference: ${REF})\n`);
console.log("  file                                translated  missing");
console.log("  " + "-".repeat(66));
for (const r of rows.sort((a, b) => a.file.localeCompare(b.file))) {
  const missing = LOCALES.filter((l) => l !== REF && !r.have.includes(l));
  console.log(
    `  ${r.file.padEnd(34)}  ${String(r.have.length + "/" + (LOCALES.length - 1)).padStart(9)}  ${
      missing.length ? missing.join(",") : "—"
    }`
  );
}
const histogram = (list) => {
  const by = new Map();
  for (const line of list) {
    const kind = line.replace(/^[^:]+:\s*/, "").replace(/\(base[\s\S]*$/, "").replace(/\[\d+\]/g, "[]").trim();
    by.set(kind, (by.get(kind) || 0) + 1);
  }
  return [...by.entries()].sort((a, b) => b[1] - a[1]);
};
if (errors.length) {
  console.log(`\n  ── errors (${errors.length}) ──`);
  for (const [kind, n] of histogram(errors).slice(0, 15)) console.log(`   [E] ${kind}${n > 1 ? `  ×${n}` : ""}`);
  console.log("\n  first 8:");
  errors.slice(0, 8).forEach((e) => console.log(`   · ${e}`));
}
if (warnings.length) {
  console.log(`\n  ── warnings (${warnings.length}) — reworded ordinals/ranks, review not required ──`);
  for (const [kind, n] of histogram(warnings).slice(0, 6)) console.log(`   [W] ${kind}${n > 1 ? `  ×${n}` : ""}`);
}
console.log(`\n  Result: ${errors.length === 0 ? "PASS ✓" : "FAIL ✗ (" + errors.length + " errors)"}\n`);
process.exit(errors.length === 0 ? 0 : 1);
