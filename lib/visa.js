// Per-nationality visa guides — data registry.
// Lives in lib/ (not in the page) so the page, the sitemap and the SEO verifier all
// derive the country list from ONE place. Add a country in exactly two spots below.
import india from "../data/visa/india.json";
import vietnam from "../data/visa/vietnam.json";
import china from "../data/visa/china.json";
import philippines from "../data/visa/philippines.json";
import indonesia from "../data/visa/indonesia.json";
import usa from "../data/visa/usa.json";
import japan from "../data/visa/japan.json";
import uk from "../data/visa/uk.json";
import canada from "../data/visa/canada.json";
import australia from "../data/visa/australia.json";
import taiwan from "../data/visa/taiwan.json";
import hongkong from "../data/visa/hongkong.json";
import singapore from "../data/visa/singapore.json";
import malaysia from "../data/visa/malaysia.json";
import thailand from "../data/visa/thailand.json";
import mongolia from "../data/visa/mongolia.json";
import bangladesh from "../data/visa/bangladesh.json";
import nepal from "../data/visa/nepal.json";
import uzbekistan from "../data/visa/uzbekistan.json";
import srilanka from "../data/visa/srilanka.json";
import pakistan from "../data/visa/pakistan.json";
import indiaI18n from "../data/visa/india.i18n.json";
import vietnamI18n from "../data/visa/vietnam.i18n.json";
import chinaI18n from "../data/visa/china.i18n.json";
import philippinesI18n from "../data/visa/philippines.i18n.json";
import indonesiaI18n from "../data/visa/indonesia.i18n.json";
import usaI18n from "../data/visa/usa.i18n.json";
import japanI18n from "../data/visa/japan.i18n.json";
import ukI18n from "../data/visa/uk.i18n.json";
import canadaI18n from "../data/visa/canada.i18n.json";
import australiaI18n from "../data/visa/australia.i18n.json";
import taiwanI18n from "../data/visa/taiwan.i18n.json";
import hongkongI18n from "../data/visa/hongkong.i18n.json";
import singaporeI18n from "../data/visa/singapore.i18n.json";
import malaysiaI18n from "../data/visa/malaysia.i18n.json";
import thailandI18n from "../data/visa/thailand.i18n.json";
import mongoliaI18n from "../data/visa/mongolia.i18n.json";
import bangladeshI18n from "../data/visa/bangladesh.i18n.json";
import nepalI18n from "../data/visa/nepal.i18n.json";
import uzbekistanI18n from "../data/visa/uzbekistan.i18n.json";
import srilankaI18n from "../data/visa/srilanka.i18n.json";
import pakistanI18n from "../data/visa/pakistan.i18n.json";

// English base guide, one per country.
export const countries = { india, vietnam, china, philippines, indonesia, usa, japan, uk, canada, australia, taiwan, hongkong, singapore, malaysia, thailand, mongolia, bangladesh, nepal, uzbekistan, srilanka, pakistan };
// Per-locale translation overrides, one file per country: { <locale>: { ...overrides } }.
const i18nMaps = { india: indiaI18n, vietnam: vietnamI18n, china: chinaI18n, philippines: philippinesI18n, indonesia: indonesiaI18n, usa: usaI18n, japan: japanI18n, uk: ukI18n, canada: canadaI18n, australia: australiaI18n, taiwan: taiwanI18n, hongkong: hongkongI18n, singapore: singaporeI18n, malaysia: malaysiaI18n, thailand: thailandI18n, mongolia: mongoliaI18n, bangladesh: bangladeshI18n, nepal: nepalI18n, uzbekistan: uzbekistanI18n, srilanka: srilankaI18n, pakistan: pakistanI18n };

/** Country codes that have a guide page — the single source for routing + sitemap. */
export const visaCountryCodes = Object.keys(countries);

// Deep-merge a locale override onto the English base.
// Arrays in the override REPLACE the base array (a locale provides the full translated array);
// plain objects merge recursively; scalars override. Missing keys fall back to English.
function mergeGuide(base, ov) {
  if (!ov) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(ov)) {
    const bv = base?.[k], ovv = ov[k];
    if (Array.isArray(ovv)) out[k] = ovv;
    else if (ovv && typeof ovv === "object" && bv && typeof bv === "object" && !Array.isArray(bv)) out[k] = mergeGuide(bv, ovv);
    else out[k] = ovv;
  }
  return out;
}

/** The guide for one country in one locale (English base + locale overrides), or null. */
export function localized(country, locale) {
  const base = countries[country];
  if (!base) return null;
  return mergeGuide(base, i18nMaps[country]?.[locale]);
}

/** Which locales actually ship a translation for a country (rest fall back to English). */
export function translatedLocales(country) {
  return Object.keys(i18nMaps[country] || {}).filter((k) => !k.startsWith("_"));
}
