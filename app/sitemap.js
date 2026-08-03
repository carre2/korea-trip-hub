import { locales } from "../lib/i18n";
import dest from "../data/destinations.json";
import plan from "../data/plan.json";

const SITE = "https://ktriphub.com";

// Static sitemap for all locale pages (helps Google discover the 20-language site).
export const dynamic = "force-static";

export default function sitemap() {
  const destSlugs = Object.keys(dest.items);
  const planSlugs = plan.order;
  const urls = [];

  for (const l of locales) {
    urls.push({ url: `${SITE}/${l}/`, changeFrequency: "weekly", priority: 1.0 });
    urls.push({ url: `${SITE}/${l}/destinations/`, changeFrequency: "weekly", priority: 0.8 });
    urls.push({ url: `${SITE}/${l}/food/`, changeFrequency: "weekly", priority: 0.8 });
    for (const s of planSlugs) urls.push({ url: `${SITE}/${l}/plan/${s}/`, changeFrequency: "monthly", priority: 0.7 });
    for (const s of destSlugs) urls.push({ url: `${SITE}/${l}/destinations/${s}/`, changeFrequency: "monthly", priority: 0.7 });
  }
  return urls;
}
