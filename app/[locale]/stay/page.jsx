import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import stayData from "../../../data/stay.json";

const CITIES = stayData.cities;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  return pageMeta({
    locale,
    path: "stay",
    title: `Where to Stay in Korea: Best Areas in Seoul, Busan & Jeju — ${SITE_NAME}`,
    description:
      "Where to stay in Korea — the best neighborhoods in Seoul, Busan and Jeju for first-timers, nightlife, beaches, culture and budget, with hotel links.",
  });
}

export default function StayHub({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);

  return (
    <article className="article">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: "Where to stay", path: "stay" },
        ])}
      />
      <a className="crumb" href={`/${locale}/#dest`}>← {m.nav?.destinations || "Destinations"}</a>
      <div className="art-head">
        <span className="aic" style={{ background: "#A7D9F3" }}>🏨</span>
        <h1>Where to Stay in Korea</h1>
      </div>
      <p className="art-tagline">Pick the right area in each city — by vibe, not just price.</p>

      <div className="vcg-hub-grid">
        {Object.entries(CITIES).map(([key, c]) => (
          <a key={key} className="vcg-hub-card" href={`/${locale}/stay/${key}/`}>
            <span className="vcg-hub-flag">{c.flag}</span>
            <span className="vcg-hub-txt">
              <b>Where to stay in {c.name}</b>
              <em>{c.areas.length} areas compared</em>
            </span>
            <span className="vcg-hub-arrow">→</span>
          </a>
        ))}
      </div>

      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
