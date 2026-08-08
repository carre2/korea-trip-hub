import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import itin from "../../../data/itineraries.json";

const ITEMS = itin.items;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  return pageMeta({
    locale,
    path: "itinerary",
    title: `Korea Itineraries: 3, 5 & 7-Day Plans (2026) — ${SITE_NAME}`,
    description:
      "Ready-made Korea itineraries, day by day — the perfect 3 days in Seoul, 5 days Seoul + Busan, and a 7-day Seoul, Busan & Jeju trip.",
  });
}

export default function ItineraryHub({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);

  return (
    <article className="article">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: "Itineraries", path: "itinerary" },
        ])}
      />
      <a className="crumb" href={`/${locale}/#planner`}>← {m.nav?.planner || "AI Planner"}</a>
      <div className="art-head">
        <span className="aic" style={{ background: "#A2E5D6" }}>🗺️</span>
        <h1>Korea Itineraries</h1>
      </div>
      <p className="art-tagline">Ready-made day-by-day plans — or build your own with the free planner.</p>

      <div className="vcg-hub-grid">
        {itin.order.map((slug) => {
          const it = ITEMS[slug];
          return (
            <a key={slug} className="vcg-hub-card" href={`/${locale}/itinerary/${slug}/`}>
              <span className="vcg-hub-flag">🗓️</span>
              <span className="vcg-hub-txt">
                <b>{it.title}</b>
                <em>{it.days}-day plan</em>
              </span>
              <span className="vcg-hub-arrow">→</span>
            </a>
          );
        })}
      </div>

      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
