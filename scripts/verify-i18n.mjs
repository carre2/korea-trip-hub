#!/usr/bin/env node
/**
 * verify-i18n.mjs — Portable translation verifier for multilingual Next.js sites.
 * Works in ANY project using the messages/<locale>.json + lib/i18n.js pattern
 * (korea-trip-hub, kpophub/web, …). Language quality is first-class (see TRANSLATION.md).
 *
 * Hard errors (exit 1):
 *   [E] Missing keys ...... a string has no translation (silently falls back to reference)
 *   [E] Number drift ...... a fact translation changed/dropped a number, date, phone, or URL
 *   [E] Placeholder drift . {{FACT:id}} / {var} placeholders don't match the source
 *   [E] Language leakage .. reference-language script leaked into a locale that shouldn't have it
 * Warnings (exit 0):
 *   [W] Possibly untranslated (value identical to reference)   [W] Extra keys
 *
 * PORTABLE: zero dependencies, auto-detects config. Drop into <project>/scripts/.
 *   - reference locale, target locales, dirs are auto-detected, or set them in
 *     an optional  i18n.verify.json  next to package.json:
 *       { "referenceLocale":"en", "messagesDir":"messages", "factsFile":"data/facts.json",
 *         "targetLocales":["en","ja",...], "leakScriptLocales":{"hangul":["ko"]} }
 *   - facts checks are skipped automatically if factsFile is absent (e.g. kpophub).
 *   - target locales are read from i18n.verify.json → else parsed from lib/i18n.js
 *     `export const locales = [...]` → else every messages/*.json present.
 *
 * Usage:  node scripts/verify-i18n.mjs            (all target locales)
 *         node scripts/verify-i18n.mjs ja zh      (subset)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const exists = (p) => fs.existsSync(p);

// ---------- config (auto-detect + optional override) ----------
const cfg = readJson(path.join(ROOT, "i18n.verify.json")) || {};
const REF = cfg.referenceLocale || "en";
const MSG_DIR = path.join(ROOT, cfg.messagesDir || "messages");
const FACTS_FILE = path.join(ROOT, cfg.factsFile || "data/facts.json");
// Locales whose script is legitimately non-Latin, so a "Korean leaked" style check is skipped.
const HANGUL_OK = new Set(cfg.leakScriptLocales?.hangul || ["ko", "ja", "zh", "zh-TW"]);

function detectTargetLocales() {
  if (Array.isArray(cfg.targetLocales) && cfg.targetLocales.length) return cfg.targetLocales;
  // try to parse lib/i18n.js  `export const locales = ["en", ...]`
  for (const rel of ["lib/i18n.js", "lib/i18n.mjs", "app/i18n.js"]) {
    const p = path.join(ROOT, rel);
    if (!exists(p)) continue;
    const m = fs.readFileSync(p, "utf8").match(/export\s+const\s+locales\s*=\s*\[([\s\S]*?)\]/);
    if (m) {
      const list = [...m[1].matchAll(/["'`]([\w-]+)["'`]/g)].map((x) => x[1]);
      if (list.length) return list;
    }
  }
  // fallback: every messages/*.json present
  return fs.readdirSync(MSG_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
}

// ---------- helpers ----------
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith("_")) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}
const placeholders = (s) => typeof s !== "string" ? []
  : (s.match(/\{\{[^}]+\}\}|\{[a-zA-Z0-9_]+\}/g) || []).sort();
function protectedTokens(s) {
  if (typeof s !== "string") return [];
  const t = new Set();
  (s.match(/\d{4}-\d{2}-\d{2}/g) || []).forEach((x) => t.add(x));
  (s.match(/\d[\d,]*(?:\.\d+)?/g) || []).forEach((x) => t.add(x));
  (s.match(/[a-z0-9-]+\.(?:go\.kr|or\.kr|co\.kr|com|net|kr)\b/gi) || []).forEach((x) => t.add(x.toLowerCase()));
  return [...t];
}
const HANGUL = /[가-힣]/;

// ---------- load reference ----------
if (!exists(MSG_DIR)) { console.error(`FATAL: messages dir not found: ${MSG_DIR}`); process.exit(2); }
const refMsg = readJson(path.join(MSG_DIR, `${REF}.json`));
if (!refMsg) { console.error(`FATAL: reference messages/${REF}.json not found`); process.exit(2); }
const refFlat = flatten(refMsg);
const isFactKey = (k) => k === "facts" || k.startsWith("facts.");
const refKeys = Object.keys(refFlat).filter((k) => !isFactKey(k));

const factsData = exists(FACTS_FILE) ? (readJson(FACTS_FILE) || {}) : null;
const factClaims = factsData ? Object.fromEntries((factsData.facts || []).map((f) => [f.id, f.claim])) : {};
const factCount = factsData ? (factsData.facts || []).length : 0;

const argLocales = process.argv.slice(2);
const targets = detectTargetLocales().filter((l) => l !== REF);
const locales = (argLocales.length ? argLocales : targets);

// ---------- verify ----------
let totalErrors = 0;
const rows = [];
for (const loc of locales) {
  const errs = [], warns = [];
  const msg = readJson(path.join(MSG_DIR, `${loc}.json`));
  if (!msg) { rows.push({ loc, pct: 0, e: 0, w: 0, note: "no messages file (reference fallback)" }); continue; }
  const flat = flatten(msg);

  const missing = refKeys.filter((k) => !(k in flat));
  Object.keys(flat).filter((k) => !(k in refFlat) && !isFactKey(k)).forEach((k) => warns.push(`extra key: ${k}`));
  missing.forEach((k) => errs.push(`missing key: ${k}`));

  for (const k of refKeys) {
    if (!(k in flat)) continue;
    const src = refFlat[k], dst = flat[k];
    if (placeholders(src).join("|") !== placeholders(dst).join("|"))
      errs.push(`placeholder drift @ ${k}`);
    if (typeof src === "string" && src === dst && src.length > 12)
      warns.push(`possibly untranslated @ ${k}`);
    if (!HANGUL_OK.has(loc) && typeof dst === "string" && HANGUL.test(dst))
      errs.push(`Korean text leaked @ ${k}`);
  }

  // fact number/date/domain preservation (only if facts file present)
  const trFacts = (msg.facts && typeof msg.facts === "object") ? msg.facts : {};
  for (const [id, tr] of Object.entries(trFacts)) {
    if (!factClaims[id]) { warns.push(`facts.${id}: no such fact`); continue; }
    if (!tr || typeof tr.claim !== "string") continue;
    const have = new Set(protectedTokens(tr.claim));
    protectedTokens(factClaims[id])
      .filter((t) => !have.has(t) && !tr.claim.toLowerCase().includes(t.toLowerCase()))
      .forEach((t) => errs.push(`facts.${id}: number/date/domain dropped: "${t}"`));
  }

  const translated = refKeys.filter((k) => k in flat).length;
  rows.push({ loc, pct: Math.round((translated / refKeys.length) * 100), e: errs.length, w: warns.length, errs, warns });
  totalErrors += errs.length;
}

// ---------- report ----------
console.log(`\n  i18n verification · ${path.basename(ROOT)}`);
console.log(`  reference: ${REF} · ${refKeys.length} keys · ${factCount} facts${factsData ? "" : " (no facts file — fact checks skipped)"}\n`);
console.log("  locale   complete   errors  warnings");
console.log("  " + "-".repeat(44));
for (const r of rows)
  console.log(`  ${r.loc.padEnd(7)}  ${(r.pct + "%").padStart(6)}   ${String(r.e).padStart(6)}  ${String(r.w).padStart(8)}${r.note ? "   " + r.note : ""}`);
for (const r of rows) {
  if (!(r.e + r.w)) continue;
  console.log(`\n  ── ${r.loc} ──`);
  (r.errs || []).slice(0, 15).forEach((m) => console.log(`   [E] ${m}`));
  if ((r.errs || []).length > 15) console.log(`   [E] …and ${r.errs.length - 15} more`);
  (r.warns || []).slice(0, 6).forEach((m) => console.log(`   [W] ${m}`));
  if ((r.warns || []).length > 6) console.log(`   [W] …and ${r.warns.length - 6} more`);
}
console.log(`\n  Result: ${totalErrors === 0 ? "PASS ✓" : "FAIL ✗ (" + totalErrors + " errors)"}\n`);
process.exit(totalErrors === 0 ? 0 : 1);
