import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, SITE_NAME, REVIEWED } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import ItineraryGuide from "../../../../components/ItineraryGuide";
import { itinFor, fill } from "../../../../lib/content";
import itin from "../../../../data/itineraries.json";

const SLUGS = Object.keys(itin.items);

export function generateStaticParams() {
  return locales.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const it = itinFor(locale).items[params.slug];
  const path = `itinerary/${params.slug}`;
  if (!it) return pageMeta({ locale, path, title: `Korea itinerary — ${SITE_NAME}` });
  return pageMeta({ locale, path, title: it.metaTitle || it.title, description: it.sub, type: "article" });
}

export default function ItineraryPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const I = itinFor(locale);
  const it = I.items[params.slug];
  const ui = I.ui;
  const m = getMessages(locale);
  if (!it) return null;

  return (
    <article className="article">
      <JsonLd
        data={[
          breadcrumbLd(locale, [
            { name: m.brand, path: "" },
            { name: ui.backToHub, path: "itinerary" },
            { name: it.title, path: `itinerary/${params.slug}` },
          ]),
          articleLd({
            locale,
            path: `itinerary/${params.slug}`,
            headline: it.title,
            description: it.sub,
            dateModified: REVIEWED.iso,
          }),
        ]}
      />
      <a className="crumb" href={`/${locale}/itinerary/`}>← {ui.backToHub}</a>
      <div className="art-head">
        <span className="aic" style={{ background: "#A2E5D6" }}>🗺️</span>
        <h1>{it.title}</h1>
      </div>
      <div className="art-meta">
        <span className="art-read">🗓️ {fill(ui.daysLabel, { n: it.days })}</span>
        <span className="art-read art-updated">🔄 {ui.updated} {REVIEWED.label}</span>
      </div>
      <p className="art-tagline">{it.sub}</p>
      <ItineraryGuide it={it} locale={locale} ui={ui} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
