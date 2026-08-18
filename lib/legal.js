// Locale-aware resolver for the legal / trust pages (Privacy, Terms, About, …).
// English base lives in data/legal.json; full per-locale copies (data/legal.<locale>.json)
// mirror lib/content.js. Any locale without a copy falls back to English.
import base from "../data/legal.json";
import ja from "../data/legal.ja.json";
import zh from "../data/legal.zh.json";
import zhTW from "../data/legal.zh-TW.json";
import vi from "../data/legal.vi.json";
import th from "../data/legal.th.json";
import id from "../data/legal.id.json";
import es from "../data/legal.es.json";
import ms from "../data/legal.ms.json";
import ko from "../data/legal.ko.json";

const LEGAL = {
  en: base, ja, zh, "zh-TW": zhTW, vi, th, id, es, ms, ko,
};

export const legalFor = (locale) => LEGAL[locale] || base;
export const legalSlugs = () => base.order;
