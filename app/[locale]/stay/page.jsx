import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import { stayFor, fill } from "../../../lib/content";
import stayBase from "../../../data/stay.json";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const ui = stayFor(locale).ui;
  return pageMeta({
    locale,
    path: "stay",
    title: `${ui.hubMetaTitle} — ${SITE_NAME}`,
    description: ui.hubMetaDesc,
  });
}

export default function StayHub({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const S = stayFor(locale);
  const CITIES = S.cities;
  const ui = S.ui;

  return (
    <article className="article">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: ui.backToHub, path: "stay" },
        ])}
      />
      <a className="crumb" href={`/${locale}/#dest`}>← {m.nav?.destinations || "Destinations"}</a>
      <div className="art-head">
        <span className="aic" style={{ background: "#A7D9F3" }}>🏨</span>
        <h1>{ui.hubH1}</h1>
      </div>
      <p className="art-tagline">{ui.hubTagline}</p>

      <div className="vcg-hub-grid">
        {Object.entries(CITIES).map(([key, c]) => (
          <a key={key} className="vcg-hub-card" href={`/${locale}/stay/${key}/`}>
            <span className="vcg-hub-flag">{c.flag}</span>
            <span className="vcg-hub-txt">
              <b>{fill(ui.cardTitle, { city: c.name })}</b>
              <em>{fill(ui.areasCompared, { n: c.areas.length })}</em>
            </span>
            <span className="vcg-hub-arrow">→</span>
          </a>
        ))}
      </div>

      {(() => {
        const TYPES = S.types && S.types.length ? S.types : stayBase.types;
        if (!TYPES || !TYPES.length) return null;
        const title = ui.typesTitle || stayBase.ui.typesTitle;
        const intro = ui.typesIntro || stayBase.ui.typesIntro;
        return (
          <section className="stay-types">
            <h2>{title}</h2>
            <p className="stay-types-intro">{intro}</p>
            <div className="stay-types-grid">
              {TYPES.map((t) => (
                <div className="stay-type" key={t.name}>
                  <div className="stay-type-h">
                    <span className="stay-type-ic" aria-hidden="true">{t.icon}</span>
                    <div><b>{t.name}</b><em>{t.best}</em></div>
                  </div>
                  <p className="stay-type-desc">{t.desc}</p>
                  <p className="stay-type-tip">💡 {t.tip}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
