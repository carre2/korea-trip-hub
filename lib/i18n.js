// Lightweight i18n (kpophub/web pattern). Default English; missing dicts fall back to en.
// SCOPE: 12 languages — Korea's top inbound tourism markets plus Russian & French
// (re-activated 2026-08 with full content translations). Other messages/*.json and
// data/*.<code>.json (ar/bn/hi/pt/de/it/tr/fil) remain in the repo but are not built.
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
import ru from "../messages/ru.json";
import fr from "../messages/fr.json";

const dicts = { en, ja, zh, "zh-TW": zhTW, vi, th, id, es, ms, ko, ru, fr };

// 12 languages for the dropdown (default English). Ordered by rough Korea-inbound weight.
export const locales = [
  "en", "zh", "zh-TW", "ja", "vi", "th", "id", "es", "ms", "ko", "ru", "fr"
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
  "ko": "한국어",
  "ru": "Русский",
  "fr": "Français"
};

// Right-to-left languages — none in the current set (Arabic was dropped).
export const rtlLocales = [];

export function getMessages(locale) {
  return dicts[locale] || en;
}

export function isLocale(x) {
  return locales.includes(x);
}
