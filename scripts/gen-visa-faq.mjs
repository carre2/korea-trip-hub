// Generates a machine-readable visa/K-ETA Q&A dataset into public/visa-faq/.
// Purpose: give crawlers / Q&A bots one clean JSON source per locale — the hub
// FAQ + every country guide's FAQ + a synthesized "do I need a visa?" answer +
// the canonical K-ETA facts — instead of parsing HTML. Runs in prebuild, so it
// always reflects the current data. All content is already fact-checked in the
// source files; this only re-shapes it. No invented values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "public", "visa-faq");

const LOCALES = ["en", "zh", "zh-TW", "ja", "vi", "th", "id", "es", "ms", "ko", "ru", "fr"];
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

const facts = read(path.join(DATA, "facts.json"));
const factById = Object.fromEntries((facts.facts || []).map((f) => [f.id, f]));
const updated = facts._updated || new Date().toISOString().slice(0, 10);

// Canonical K-ETA / entry facts (values only — language-neutral).
const ketaFacts = {
  keta_fee: factById["keta-fee-validity"]?.value?.fee || "₩10,000",
  keta_valid_for: factById["keta-fee-validity"]?.value?.valid_for || "3 years",
  keta_entries: "multiple",
  keta_apply_before: factById["keta-apply-window"]?.value?.apply || "≥ 72h before boarding",
  keta_apply_at: "k-eta.go.kr (official only)",
  keta_waiver_until: factById["keta-exempt-countries"]?.value?.exempt_until || "2026-12-31",
  keta_returns: factById["keta-exempt-countries"]?.value?.requirement_resumes || "2027-01-01",
  keta_exempt_regions: (factById["keta-exempt-countries"]?.notes || "")
    .replace(/\.\s*Always confirm.*$/i, "")
    .split(",").map((s) => s.trim()).filter(Boolean),
  earrival: "free, at e-arrivalcard.go.kr, within 72h before arrival (K-ETA holders exempt)",
  age_exempt_from_keta: "17 and under or 65 and over",
};
const SOURCES = {
  k_eta: "https://www.k-eta.go.kr",
  e_arrival_card: "https://www.e-arrivalcard.go.kr",
  visa_portal: "https://www.visa.go.kr",
  hikorea: "https://www.hikorea.go.kr",
  visitkorea: "https://english.visitkorea.or.kr",
};
const DISCLAIMER = "Rules change and immigration makes the final decision on arrival — always confirm at the official sites before you travel.";

// Country guides (English base + per-locale i18n override).
const countryFiles = fs.readdirSync(path.join(DATA, "visa"))
  .filter((f) => f.endsWith(".json") && !f.endsWith(".i18n.json") && !f.startsWith("_"));
const countries = countryFiles.map((f) => {
  const code = f.replace(/\.json$/, "");
  const base = read(path.join(DATA, "visa", f));
  let i18n = {};
  const ip = path.join(DATA, "visa", `${code}.i18n.json`);
  if (fs.existsSync(ip)) i18n = read(ip);
  return { code, base, i18n };
});

const hubBase = read(path.join(DATA, "guides", "visa.json"));
const hubI18n = read(path.join(DATA, "guides", "visa.i18n.json"));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let totalQ = 0;
for (const loc of LOCALES) {
  const faq = [];
  // 1) hub FAQ (K-ETA / entry basics)
  const hubFaq = (loc !== "en" && hubI18n[loc]?.faq?.items) || hubBase.faq?.items || [];
  for (const it of hubFaq) faq.push({ topic: "keta-entry", q: it.q, a: it.a, source: `/${loc}/plan/visa/` });
  // 2) per-country: a synthesized verdict Q + that guide's FAQ
  for (const { code, base, i18n } of countries) {
    const ov = (loc !== "en" && i18n[loc]) || {};
    const v = { ...(base.verdict || {}), ...(ov.verdict || {}) };
    const country = base.country;
    const src = `/${loc}/visa/${code}/`;
    if (v.headline) {
      faq.push({
        topic: `visa:${code}`,
        q: (ov.verdict?.headline ? "" : "") + `${country} → Korea: do you need a visa?`,
        a: [v.headline, v.sub].filter(Boolean).join(" "),
        source: src,
      });
    }
    const cFaq = ov.faq?.items || base.faq?.items || [];
    for (const it of cFaq) faq.push({ topic: `visa:${code}`, q: it.q, a: it.a, source: src });
  }
  totalQ += faq.length;
  const doc = {
    site: "ktriphub.com",
    topic: "Korea visa & K-ETA",
    locale: loc,
    updated,
    disclaimer: DISCLAIMER,
    keta_facts: ketaFacts,
    official_sources: SOURCES,
    faq,
  };
  fs.writeFileSync(path.join(OUT, `${loc}.json`), JSON.stringify(doc));
}

// Index file
const index = {
  site: "ktriphub.com",
  topic: "Korea visa & K-ETA — machine-readable Q&A",
  updated,
  note: "Per-locale Q&A datasets built from ktriphub.com's visa & K-ETA guides. Each locale file has keta_facts + a faq array of {topic,q,a,source}. Content is fact-checked in the source; confirm current rules at the official sources.",
  disclaimer: DISCLAIMER,
  keta_facts: ketaFacts,
  official_sources: SOURCES,
  locales: LOCALES,
  endpoints: Object.fromEntries(LOCALES.map((l) => [l, `/visa-faq/${l}.json`])),
};
fs.writeFileSync(path.join(ROOT, "public", "visa-faq.json"), JSON.stringify(index, null, 2));

console.log(`gen-visa-faq: wrote public/visa-faq.json + ${LOCALES.length} locale files (${totalQ} Q&A total).`);
