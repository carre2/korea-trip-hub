#!/usr/bin/env node
/**
 * export-review.mjs — Generate native-speaker review sheets (CSV) per locale.
 *
 * For each locale, writes review/<locale>.csv with columns:
 *   key, English (source), <locale> (current), Reviewer fix, Notes
 * A native speaker opens it in Google Sheets / Excel, fixes the translation in the
 * "Reviewer fix" column, and sends it back. We paste approved fixes into messages/<locale>.json.
 *
 * Machine-assisted translations (esp. hi/ar/bn/tr/fil/ms/vi/th/id) should be reviewed this way.
 *
 * Usage:  node scripts/export-review.mjs            (all non-en locales that have a file)
 *         node scripts/export-review.mjs hi ar bn   (subset)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MSG = path.join(ROOT, "messages");
const OUT = path.join(ROOT, "review");
const REF = "en";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.startsWith("_")) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}
const csvCell = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;

const refFlat = flatten(readJson(path.join(MSG, `${REF}.json`)));
const refKeys = Object.keys(refFlat).filter((k) => k !== "facts" && !k.startsWith("facts."));

const present = fs.readdirSync(MSG).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
const arg = process.argv.slice(2);
const locales = (arg.length ? arg : present).filter((l) => l !== REF);

fs.mkdirSync(OUT, { recursive: true });
let made = 0;
for (const loc of locales) {
  const p = path.join(MSG, `${loc}.json`);
  if (!fs.existsSync(p)) { console.log(`skip ${loc}: no file`); continue; }
  const flat = flatten(readJson(p));
  const rows = [["key", "English (source)", `${loc} (current)`, "Reviewer fix", "Notes"].map(csvCell).join(",")];
  for (const k of refKeys) {
    rows.push([k, refFlat[k], flat[k] ?? "(missing)", "", ""].map(csvCell).join(","));
  }
  const dest = path.join(OUT, `${loc}.csv`);
  fs.writeFileSync(dest, "﻿" + rows.join("\r\n"), "utf8"); // BOM for Excel/Sheets UTF-8
  console.log(`✓ review/${loc}.csv  (${refKeys.length} strings)`);
  made++;
}
console.log(`\nDone: ${made} review sheet(s) in review/. Open in Google Sheets, fix the "Reviewer fix" column.`);
