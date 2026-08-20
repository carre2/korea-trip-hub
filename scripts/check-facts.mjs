#!/usr/bin/env node
// Fact-freshness gate. Fails the build when a fact's `recheck_after` date has
// passed, forcing a human to re-verify the number/rule against its source and
// then bump the date. Warns (without failing) about facts due within 30 days.
//
//   node scripts/check-facts.mjs           # strict: exit 1 if anything overdue
//   SKIP_FACT_GATE=1 node scripts/check-facts.mjs   # emergency bypass (exit 0)
//
// Wired into `prebuild`, so `npm run build` (local + Cloudflare) enforces it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FACTS = path.join(ROOT, "data", "facts.json");
const SOON_DAYS = 30;

const today = new Date();
const todayISO = today.toISOString().slice(0, 10);
const soonISO = new Date(today.getTime() + SOON_DAYS * 864e5).toISOString().slice(0, 10);

const data = JSON.parse(fs.readFileSync(FACTS, "utf8"));
const facts = data.facts || [];

const overdue = [];
const dueSoon = [];
for (const f of facts) {
  const d = f.recheck_after;
  if (!d) continue;
  if (d < todayISO) overdue.push(f);
  else if (d <= soonISO) dueSoon.push(f);
}

const line = (f) => `  · ${f.id.padEnd(28)} recheck_after ${f.recheck_after}  (${f.source_name || "source"})`;

console.log(`Fact freshness — ${facts.length} facts, checked against ${todayISO}`);
if (dueSoon.length) {
  console.log(`\n  ⚠ due within ${SOON_DAYS} days (${dueSoon.length}) — plan a re-check:`);
  dueSoon.sort((a, b) => a.recheck_after.localeCompare(b.recheck_after)).forEach((f) => console.log(line(f)));
}

if (overdue.length && !process.env.SKIP_FACT_GATE) {
  console.error(`\n  ✗ ${overdue.length} fact(s) OVERDUE — re-verify each against its source, then update`);
  console.error(`    "verified" and "recheck_after" in data/facts.json:`);
  overdue.sort((a, b) => a.recheck_after.localeCompare(b.recheck_after)).forEach((f) => console.error(line(f)));
  console.error(`\n  (emergency bypass: set SKIP_FACT_GATE=1 — but re-verify before the next deploy.)`);
  process.exit(1);
}

console.log(overdue.length
  ? `\n  ✓ ${overdue.length} overdue, but SKIP_FACT_GATE is set — bypassing.`
  : `\n  ✓ no overdue facts.`);
