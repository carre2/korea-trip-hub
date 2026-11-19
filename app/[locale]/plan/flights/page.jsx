import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, SITE_NAME, REVIEWED } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import { linkify } from "../../../../lib/linkify";
import ArticleTrust from "../../../../components/ArticleTrust";
import NextSteps from "../../../../components/NextSteps";
import flightsUi from "../../../../data/flights-ui.json";

// Static sibling of plan/[slug] — "flights" isn't a plan slug, so no route clash.
// Informational for now (no affiliate): trusted compare links + timing tips. When a
// Travelpayouts flight widget is added later, it slots into the "Compare & book" box.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const t = flightsUi[locale] || flightsUi.en;
  return pageMeta({
    locale,
    path: "plan/flights",
    title: t.metaTitle || `${t.title} — ${SITE_NAME}`,
    description: t.metaDesc,
    type: "article",
  });
}

const SKYSCANNER = "https://www.skyscanner.net/transport/flights-to/sel/";
const GOOGLE_FLIGHTS = "https://www.google.com/travel/flights?q=flights%20to%20Seoul";

export default function FlightsGuide({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const t = flightsUi[locale] || flightsUi.en;

  return (
    <article className="article">
      <JsonLd
        data={[
          breadcrumbLd(locale, [
            { name: m.brand, path: "" },
            { name: t.title, path: "plan/flights" },
          ]),
          articleLd({ locale, path: "plan/flights", headline: t.title, description: t.metaDesc, dateModified: REVIEWED.iso }),
        ]}
      />
      <a className="crumb" href={`/${locale}/#plan`}>← {m.nav.plan}</a>

      <div className="art-head">
        <span className="aic" style={{ background: "#2B6CB0" }}>✈️</span>
        <h1>{t.title}</h1>
      </div>
      <div className="art-meta">
        {t.kicker && <span className="art-kicker">{t.kicker}</span>}
        <span className="art-read art-updated">🔄 {m.footer.updatedLabel} {REVIEWED.iso}</span>
      </div>
      <p className="art-tagline">{t.intro}</p>

      {/* Compare & book — trusted search sites (no affiliate). Future flight widget slots here. */}
      <section className="gv-sec">
        <h2>{t.compareH2}</h2>
        <div className="actcard-actions">
          <a className="actcard-btn" href={SKYSCANNER} target="_blank" rel="noopener noreferrer">
            <span className="actcard-btn-ico" aria-hidden="true">🔎</span>
            <span className="actcard-btn-txt"><b>{t.skyLabel}</b></span>
            <span className="actcard-btn-go" aria-hidden="true">↗</span>
          </a>
          <a className="actcard-btn" href={GOOGLE_FLIGHTS} target="_blank" rel="noopener noreferrer">
            <span className="actcard-btn-ico" aria-hidden="true">✈️</span>
            <span className="actcard-btn-txt"><b>{t.gflLabel}</b></span>
            <span className="actcard-btn-go" aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="art-disclaimer" style={{ marginTop: 12 }}>{t.compareNote}</p>
      </section>

      <section className="gv-sec">
        <h2>{t.tipsH2}</h2>
        <ul className="tips">
          {t.tips.map((tip, i) => <li key={i}>{tip}</li>)}
        </ul>
      </section>

      <section className="gv-sec">
        <h2>{t.airportH2}</h2>
        <p>{linkify(t.airportBody, locale)}</p>
      </section>

      <NextSteps locale={locale} m={m} heading={m.nextSteps?.heading} />
      <ArticleTrust locale={locale} reviewed={REVIEWED.iso} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
