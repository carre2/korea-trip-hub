import { locales, defaultLocale } from "../lib/i18n";
import { pagePaths } from "../lib/routes";
import { url } from "../lib/seo";

// Static sitemap for all locale pages, with per-URL hreflang alternates so Google can pair
// the 20 language versions of each page. Paths come from lib/routes.js (same source the
// SEO verifier diffs against the built HTML) — never hand-maintain the list here.
// No lastModified: we don't have per-page modification dates, and inventing them would
// mislead crawlers (HARNESS: no made-up values).
export const dynamic = "force-static";

export default function sitemap() {
  const out = [];
  for (const { path, priority, changeFrequency } of pagePaths()) {
    const languages = Object.fromEntries(locales.map((l) => [l, url(l, path)]));
    languages["x-default"] = url(defaultLocale, path);
    for (const locale of locales) {
      out.push({
        url: url(locale, path),
        changeFrequency,
        priority,
        alternates: { languages },
      });
    }
  }
  return out;
}
