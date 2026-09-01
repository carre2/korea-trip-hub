import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME, REVIEWED } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import KpopGuide from "../../../components/KpopGuide";
import ArticleTrust from "../../../components/ArticleTrust";
import { itinFor } from "../../../lib/content";
import kpopEn from "../../../data/kpop.json";
import kpopJa from "../../../data/kpop.ja.json";
import kpopZh from "../../../data/kpop.zh.json";
import kpopZhTW from "../../../data/kpop.zh-TW.json";
import kpopVi from "../../../data/kpop.vi.json";
import kpopTh from "../../../data/kpop.th.json";
import kpopId from "../../../data/kpop.id.json";
import kpopEs from "../../../data/kpop.es.json";
import kpopMs from "../../../data/kpop.ms.json";
import kpopKo from "../../../data/kpop.ko.json";
import kpopRu from "../../../data/kpop.ru.json";
import kpopFr from "../../../data/kpop.fr.json";

const KPOP = {
  en: kpopEn, ja: kpopJa, zh: kpopZh, "zh-TW": kpopZhTW, vi: kpopVi,
  th: kpopTh, id: kpopId, es: kpopEs, ms: kpopMs, ko: kpopKo,
  ru: kpopRu, fr: kpopFr,
};
const kpopFor = (locale) => KPOP[locale] || kpopEn;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const ui = kpopFor(locale).ui;
  return pageMeta({
    locale,
    path: "kpop",
    title: ui.metaTitle,
    description: ui.metaDesc,
  });
}

export default function KpopPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const g = kpopFor(locale);
  const ui = g.ui;

  return (
    <article className="article">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: ui.h1, path: "kpop" },
        ])}
      />
      <a className="crumb" href={`/${locale}/#kculture`}>← {m.nav?.kculture || "K-Culture"}</a>
      <div className="art-head">
        <span className="aic" style={{ background: "#FF3E6C" }}>🎤</span>
        <h1>{ui.h1}</h1>
      </div>
      <div className="art-meta">
        <span className="art-read art-updated">🔄 {ui.updated || "Updated"} {REVIEWED.label}</span>
      </div>
      <p className="art-tagline">{ui.tagline}</p>
      <KpopGuide g={g} ui={ui} />

      {(() => {
        const trip = itinFor(locale).items["kpop-3-days"];
        return trip ? (
          <a className="kpop-tripcta" href={`/${locale}/itinerary/kpop-3-days/`}>
            <span className="ktc-ic" aria-hidden="true">🗺️</span>
            <span className="ktc-txt"><b>{trip.title}</b><em>{trip.sub}</em></span>
            <span className="ktc-arrow" aria-hidden="true">→</span>
          </a>
        ) : null;
      })()}

      <ArticleTrust locale={locale} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
