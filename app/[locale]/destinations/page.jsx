import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { fact } from "../../../lib/facts";
import dest from "../../../data/destinations.json";
import destJa from "../../../data/destinations.ja.json";
import destZh from "../../../data/destinations.zh.json";
import destEs from "../../../data/destinations.es.json";
import destFr from "../../../data/destinations.fr.json";
import destDe from "../../../data/destinations.de.json";
import destPt from "../../../data/destinations.pt.json";

const destI18n = { ja: destJa, zh: destZh, es: destEs, fr: destFr, de: destDe, pt: destPt };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata() {
  return { title: "Destinations — Korea Trip Hub" };
}

export default function Destinations({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const t = m.dest;
  const ov = destI18n[locale]?.items || {};
  const entries = Object.entries(dest.items).map(([slug, d]) => [slug, { ...d, ...(ov[slug] || {}) }]);

  return (
    <section>
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
                  return (
                    <a className="card" key={slug} href={`/${locale}/destinations/${slug}/`}>
                      <div className="thumb" style={{ background: d.grad }}>{d.icon}
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
