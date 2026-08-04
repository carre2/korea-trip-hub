// Lightweight i18n (kpophub/web pattern). Default English; missing dicts fall back to en.
// SCOPE: 10 core languages, chosen for Korea's top inbound tourism markets.
// (Dropped ar/bn/hi/pt/ru/fr/de/it/tr/fil in 2026-08 to focus translation effort;
//  their messages/*.json and data/*.<code>.json remain in the repo but are no longer built.)
import en from "../messages/en.json";
import ja from "../messages/ja.json";
import zh from "../messages/zh.json";
import vi from "../messages/vi.json";
import th from "../messages/th.json";
import id from "../messages/id.json";
import es from "../messages/es.json";
import ko from "../messages/ko.json";
import zhTW from "../messages/zh-TW.json";
import ms from "../messages/ms.json";

const dicts = { en, ja, zh, "zh-TW": zhTW, vi, th, id, es, ms, ko };

// 10 languages for the dropdown (default English). Ordered by rough Korea-inbound weight.
export const locales = [
  "en", "zh", "zh-TW", "ja", "vi", "th", "id", "es", "ms", "ko"
];

export const defaultLocale = "en";

export const localeNames = {
  "en": "English",
  "zh": "中文 (简体)",
  "zh-TW": "中文 (繁體)",
  "ja": "日本語",
  "vi": "Tiếng Việt",
  "th": "ไทย",
  "id": "Bahasa Indonesia",
  "es": "Español",
  "ms": "Bahasa Melayu",
  "ko": "한국어"
};

// Right-to-left languages — none in the current set (Arabic was dropped).
export const rtlLocales = [];

export function getMessages(locale) {
  return dicts[locale] || en;
}

export function isLocale(x) {
  return locales.includes(x);
}
