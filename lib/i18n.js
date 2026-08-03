// Lightweight i18n (kpophub/web pattern). Default English; missing dicts fall back to en.
import en from "../messages/en.json";
import ja from "../messages/ja.json";

// Dicts that exist today. Add more as messages/<code>.json are translated.
const dicts = { en, ja };

// 20 languages for the dropdown (default English). Content-complete: en only for now;
// the rest render in English until their messages/<code>.json is added (see HARNESS: no fake data, incl. translations).
export const locales = [
  "en", "zh", "zh-TW", "ja", "vi", "th", "id",
  "es", "hi", "ar", "pt", "ru", "fr", "de",
  "it", "tr", "fil", "ms", "bn", "ko"
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
  "hi": "हिन्दी",
  "ar": "العربية",
  "pt": "Português",
  "ru": "Русский",
  "fr": "Français",
  "de": "Deutsch",
  "it": "Italiano",
  "tr": "Türkçe",
  "fil": "Filipino",
  "ms": "Bahasa Melayu",
  "bn": "বাংলা",
  "ko": "한국어"
};

// Right-to-left languages (Arabic) — for <html dir>.
export const rtlLocales = ["ar"];

export function getMessages(locale) {
  return dicts[locale] || en;
}

export function isLocale(x) {
  return locales.includes(x);
}
