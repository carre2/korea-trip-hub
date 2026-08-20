import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import { fact } from "../../../lib/facts";
import dest from "../../../data/destinations.json";
import destJa from "../../../data/destinations.ja.json";
import destZh from "../../../data/destinations.zh.json";
import destEs from "../../../data/destinations.es.json";
import destFr from "../../../data/destinations.fr.json";
import destDe from "../../../data/destinations.de.json";
import destPt from "../../../data/destinations.pt.json";
import destIt from "../../../data/destinations.it.json";
import destRu from "../../../data/destinations.ru.json";
import destKo from "../../../data/destinations.ko.json";
import destZhTW from "../../../data/destinations.zh-TW.json";
import destVi from "../../../data/destinations.vi.json";
import destTh from "../../../data/destinations.th.json";
import destId from "../../../data/destinations.id.json";
import destTr from "../../../data/destinations.tr.json";
import destFil from "../../../data/destinations.fil.json";
import destMs from "../../../data/destinations.ms.json";
import destHi from "../../../data/destinations.hi.json";
import destAr from "../../../data/destinations.ar.json";
import destBn from "../../../data/destinations.bn.json";
import destImages from "../../../data/dest-images.json";

const destI18n = { ja: destJa, zh: destZh, "zh-TW": destZhTW, es: destEs, fr: destFr, de: destDe, pt: destPt, it: destIt, ru: destRu, ko: destKo, vi: destVi, th: destTh, id: destId, tr: destTr, fil: destFil, ms: destMs, hi: destHi, ar: destAr, bn: destBn };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  return pageMeta({
    locale,
    path: "destinations",
    title: `${m.dest.title} — ${SITE_NAME}`,
    description: m.dest.sub,
  });
}

export default function Destinations({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const t = m.dest;
  const ov = destI18n[locale]?.items || {};
  const entries = Object.entries(dest.items).map(([slug, d]) => [slug, { ...d, ...(ov[slug] || {}) }]);

  return (
    <section>
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: t.title, path: "destinations" },
        ])}
      />
      <div className="wrap">
        <div className="sec-head">
          <div>
            <span className="eyebrow">{t.title}</span>
            <h2>{t.title}</h2>
            <p>{t.sub}</p>
          </div>
          <a className="btn ghost" href={`/${locale}/#planner`}>✨ {m.hero.build}</a>
        </div>

        {dest.cities.map((city) => {
          const items = entries.filter(([, d]) => d.city === city.key);
          if (!items.length) return null;
          return (
            <div key={city.key} style={{ marginBottom: 34 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "6px 0 14px", letterSpacing: "-.01em" }}>
                📍 {city.name}
              </h3>
              <div className="grid g4">
                {items.map(([slug, d]) => {
                  const f = d.factId ? fact(d.factId) : null;
                  const stat = f && f.value ? Object.values(f.value)[0] : null;
                  const im = destImages[slug];
                  return (
                    <a className="card" key={slug} href={`/${locale}/destinations/${slug}/`}>
                      <div className={`thumb${im ? " thumb-img" : ""}`} style={im ? undefined : { background: d.grad }}>
                        {im ? <img src={im.img} alt={d.name} width={1280} height={853} loading="lazy" /> : d.icon}
                        <span className="rank">🔎 {d.rank}</span>
                      </div>
                      <div className="cbody">
                        <h3>{d.name}</h3>
                        <p>{d.blurb}</p>
                        {stat && <div className="kw">›_ {stat} {f.value.rank ? "· daily visitors" : ""}</div>}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
