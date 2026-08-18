// Locale-aware resolver for the legal / trust pages (Privacy, Terms, About, …).
// English base lives in data/legal.json; full per-locale copies (data/legal.<locale>.json)
// get registered in LEGAL as they are translated, mirroring lib/content.js. Any locale
// without a copy falls back to English.
import base from "../data/legal.json";

const LEGAL = {
  en: base,
  // ja, zh, "zh-TW", vi, th, id, es, ms, ko — added here once translated.
};

export const legalFor = (locale) => LEGAL[locale] || base;
export const legalSlugs = () => base.order;
