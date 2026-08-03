import { locales } from "../lib/i18n";
import dest from "../data/destinations.json";
import plan from "../data/plan.json";
import india from "../data/visa/india.json";
import vietnam from "../data/visa/vietnam.json";
import china from "../data/visa/china.json";
import philippines from "../data/visa/philippines.json";
import indonesia from "../data/visa/indonesia.json";

const SITE = "https://ktriphub.com";

// Per-nationality visa guide country codes.
const visaCountries = [india.code, vietnam.code, china.code, philippines.code, indonesia.code];

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
    for (const c of visaCountries) urls.push({ url: `${SITE}/${l}/visa/${c}/`, changeFrequency: "monthly", priority: 0.9 });
  }
  return urls;
}
