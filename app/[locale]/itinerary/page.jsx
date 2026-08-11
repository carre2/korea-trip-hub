import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import { itinFor, fill } from "../../../lib/content";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const ui = itinFor(locale).ui;
  return pageMeta({
    locale,
    path: "itinerary",
    title: `${ui.hubMetaTitle} — ${SITE_NAME}`,
    description: ui.hubMetaDesc,
  });
}

export default function ItineraryHub({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const I = itinFor(locale);
  const ITEMS = I.items;
  const ui = I.ui;

  return (
    <article className="article">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: ui.backToHub, path: "itinerary" },
        ])}
      />
      <a className="crumb" href={`/${locale}/#planner`}>← {m.nav?.planner || "AI Planner"}</a>
      <div className="art-head">
        <span className="aic" style={{ background: "#A2E5D6" }}>🗺️</span>
        <h1>{ui.hubH1}</h1>
      </div>
      <p className="art-tagline">{ui.hubTagline}</p>

      <div className="vcg-hub-grid">
        {I.order.map((slug) => {
          const it = ITEMS[slug];
          return (
            <a key={slug} className="vcg-hub-card" href={`/${locale}/itinerary/${slug}/`}>
              <span className="vcg-hub-flag">🗓️</span>
              <span className="vcg-hub-txt">
                <b>{it.title}</b>
                <em>{fill(ui.dayPlan, { n: it.days })}</em>
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
