// SEO helpers — one source of truth for canonical URLs, hreflang, OG/Twitter cards.
//
// WHY THIS FILE EXISTS
// Next.js merges metadata from layout → page, but `alternates` is INHERITED when a page
// doesn't set it. A canonical declared in app/[locale]/layout.jsx therefore leaks the locale
// HOME url onto every child page ("this page is a duplicate of the home page"), which is how
// 640 of 660 URLs ended up de-indexable. Rule: every page calls pageMeta() with its own path.
// scripts/verify-seo.mjs fails the build if any built page breaks that rule.
import { locales, defaultLocale } from "./i18n";

export const SITE = "https://ktriphub.com";
export const SITE_NAME = "Korea Trip Hub";

// Content review date. Shown on pages AND fed to Article dateModified, so the
// schema only restates what's visible (HARNESS). Real maintenance date — bump
// it when content is reviewed; not an invented fact about Korea.
export const REVIEWED = { iso: "2026-08-06", label: "August 2026" };

// Default share card. Original artwork (see public/img/CREDITS.md) — the site's photos are
// CC BY-SA and require visible attribution, which a social card can't carry.
export const OG_IMAGE = { url: "/img/og/ktriphub-og.jpg", width: 1200, height: 630 };

// og:locale wants language_TERRITORY, not our bare hreflang codes.
const OG_LOCALE = {
  en: "en_US", zh: "zh_CN", "zh-TW": "zh_TW", ja: "ja_JP", vi: "vi_VN",
  th: "th_TH", id: "id_ID", es: "es_ES", ms: "ms_MY", ko: "ko_KR",
};

/** Absolute URL for a locale + page path. `path` is without leading/trailing slashes ("" = locale home).
 *  Always trailing-slashed to match next.config.mjs `trailingSlash: true`. */
export function url(locale, path = "") {
  const p = String(path).replace(/^\/+|\/+$/g, "");
  return `${SITE}/${locale}/${p ? p + "/" : ""}`;
}

/** Self-referencing canonical + the full hreflang set for THIS path (not the home page). */
export function alternates(locale, path = "") {
  const languages = Object.fromEntries(locales.map((l) => [l, url(l, path)]));
  languages["x-default"] = url(defaultLocale, path);
  return { canonical: url(locale, path), languages };
}

/** Complete per-page metadata: canonical, hreflang, Open Graph, Twitter card.
 *  `image` overrides the brand card and must be a real file under public/ —
 *  verify-seo.mjs fails the build if the referenced file isn't in the output. */
export function pageMeta({ locale, path = "", title, description, image, type = "website" }) {
  const canonical = url(locale, path);
  const card = image ? { url: image } : OG_IMAGE;
  const images = [{ ...card, alt: title }];
  return {
    metadataBase: new URL(SITE),
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale] || locale,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [card.url],
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD builders. HARNESS rule applies: structured data may only restate what
// is already on the page — never invent ratings, prices, addresses or dates.
// ---------------------------------------------------------------------------

/** WebSite node for the locale home. */
export function webSiteLd(locale, name, description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url(locale)}#website`,
    url: url(locale),
    name,
    description,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE },
  };
}

/** BreadcrumbList. `trail` = [{ name, path }] from the locale home down to this page. */
export function breadcrumbLd(locale, trail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: url(locale, step.path),
    })),
  };
}

/** FAQPage from a guide's faq block. Returns null when there is nothing to mark up. */
export function faqLd(items, locale) {
  const qa = (items || []).filter((x) => x && x.q && x.a);
  if (!qa.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Article for the long-form guides (visa / transit deep-dives).
 *  `dateModified` is passed only when the guide actually carries an updated date. */
export function articleLd({ locale, path, headline, description, image, dateModified }) {
  const node = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url(locale, path) },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE },
  };
  if (image) node.image = `${SITE}${image}`;
  if (dateModified) node.dateModified = dateModified;
  return node;
}

/** TouristAttraction for a destination detail page. HARNESS: name/description are the
 *  on-page name + blurb; `cityName` groups it into a Korean city. No ratings/prices invented. */
export function touristAttractionLd({ locale, path, name, description, cityName, image }) {
  const node = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name,
    description,
    inLanguage: locale,
    url: url(locale, path),
  };
  if (image) node.image = `${SITE}${image}`;
  if (cityName) {
    node.containedInPlace = {
      "@type": "City",
      name: cityName,
      address: { "@type": "PostalAddress", addressCountry: "KR" },
    };
  }
  return node;
}
