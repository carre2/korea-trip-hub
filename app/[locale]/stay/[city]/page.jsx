import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, SITE_NAME, REVIEWED } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import StayGuide from "../../../../components/StayGuide";
import ArticleTrust from "../../../../components/ArticleTrust";
import { stayFor, fill } from "../../../../lib/content";
import stayData from "../../../../data/stay.json";

const CITY_KEYS = Object.keys(stayData.cities);

export function generateStaticParams() {
  return locales.flatMap((locale) => CITY_KEYS.map((city) => ({ locale, city })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const c = stayFor(locale).cities[params.city] || stayData.cities[params.city];
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
  const S = stayFor(locale);
  const c = S.cities[params.city] || stayData.cities[params.city];
  const ui = S.ui;
  const m = getMessages(locale);
  if (!c) return null;

  const cityH1 = fill(ui.cityH1, { city: c.name });

  return (
    <article className="article">
      <JsonLd
        data={[
          breadcrumbLd(locale, [
            { name: m.brand, path: "" },
            { name: ui.backToHub, path: "stay" },
            { name: c.name, path: `stay/${params.city}` },
          ]),
          articleLd({
            locale,
            path: `stay/${params.city}`,
            headline: cityH1,
            description: c.intro,
            dateModified: REVIEWED.iso,
          }),
        ]}
      />
      <a className="crumb" href={`/${locale}/stay/`}>← {ui.backToHub}</a>
      <div className="art-head">
        <span className="aic vcg-flagbox">{c.flag}</span>
        <h1>{cityH1}</h1>
      </div>
      <div className="art-meta">
        <span className="art-read art-updated">🔄 {ui.updated} {REVIEWED.label}</span>
      </div>
      <p className="art-tagline">{ui.cityTagline}</p>
      <StayGuide city={c} cityKey={params.city} ui={ui} />
      <ArticleTrust
        locale={locale}
        related={CITY_KEYS.filter((k) => k !== params.city).slice(0, 3).map((k) => ({
          href: `/${locale}/stay/${k}/`,
          label: S.cities[k]?.name || k,
        }))}
      />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
