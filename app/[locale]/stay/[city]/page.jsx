import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, SITE_NAME, REVIEWED } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import StayGuide from "../../../../components/StayGuide";
import stayData from "../../../../data/stay.json";

const CITIES = stayData.cities;

export function generateStaticParams() {
  return locales.flatMap((locale) => Object.keys(CITIES).map((city) => ({ locale, city })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const c = CITIES[params.city];
  const path = `stay/${params.city}`;
  if (!c) return pageMeta({ locale, path, title: `Where to stay — ${SITE_NAME}` });
  return pageMeta({
    locale,
    path,
    title: c.metaTitle || `Where to Stay in ${c.name} — ${SITE_NAME}`,
    description: c.intro,
    type: "article",
  });
}

export default function StayCity({ params }) {
  const locale = params?.locale || defaultLocale;
  const c = CITIES[params.city];
  const m = getMessages(locale);
  if (!c) return null;

  return (
    <article className="article">
      <JsonLd
        data={[
          breadcrumbLd(locale, [
            { name: m.brand, path: "" },
            { name: "Where to stay", path: "stay" },
            { name: c.name, path: `stay/${params.city}` },
          ]),
          articleLd({
            locale,
            path: `stay/${params.city}`,
            headline: `Where to Stay in ${c.name}`,
            description: c.intro,
            dateModified: REVIEWED.iso,
          }),
        ]}
      />
      <a className="crumb" href={`/${locale}/stay/`}>← Where to stay</a>
      <div className="art-head">
        <span className="aic vcg-flagbox">{c.flag}</span>
        <h1>Where to Stay in {c.name}</h1>
      </div>
      <div className="art-meta">
        <span className="art-read art-updated">🔄 Updated {REVIEWED.label}</span>
      </div>
      <p className="art-tagline">The best areas &amp; neighborhoods — chosen by vibe, not just price.</p>
      <StayGuide city={c} cityKey={params.city} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
