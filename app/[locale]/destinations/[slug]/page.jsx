import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { fact } from "../../../../lib/facts";
import dest from "../../../../data/destinations.json";
import destJa from "../../../../data/destinations.ja.json";
import destZh from "../../../../data/destinations.zh.json";
import destEs from "../../../../data/destinations.es.json";

const destI18n = { ja: destJa, zh: destZh, es: destEs };

export function generateStaticParams() {
  const slugs = Object.keys(dest.items);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const d = dest.items[params.slug];
  return { title: `${d ? d.name : "Destination"} — Korea Trip Hub`, description: d?.blurb };
}

export default function DestinationDetail({ params }) {
  const locale = params?.locale || defaultLocale;
  const d = { ...dest.items[params.slug], ...(destI18n[locale]?.items?.[params.slug] || {}) };
  const m = getMessages(locale);
  const t = m.dest;
  const ui = m.factsUI || {};
  const f = d.factId ? fact(d.factId) : null;
  const trFact = (m.facts && m.facts[d.factId]) || {};

  return (
    <article className="article">
      <a className="crumb" href={`/${locale}/destinations/`}>← {t.browseAll}</a>

      <div className="art-head">
        <span className="aic" style={{ background: d.grad }}>{d.icon}</span>
        <h1>{d.name}</h1>
      </div>
      <p className="art-tagline">{d.blurb}</p>

      {f && (
        <div className="factbox" style={{ marginBottom: 8 }}>
          <div className="factbox-h">
            <b>{trFact.claim || f.claim}</b>
            <span className="pill verified">✓ {f.verified}</span>
          </div>
          <div className="factsrc">
            <span>{ui.source || "Source"}:{" "}
              <a href={f.source} target="_blank" rel="noopener noreferrer">{f.source_name}</a>
            </span>
          </div>
        </div>
      )}

      <h2>{t.whyGo}</h2>
      {d.intro.map((p, i) => <p key={i} className={i ? "lead" : ""}>{p}</p>)}

      {d.tips?.length > 0 && (
        <>
          <h2>{t.goodToKnow}</h2>
          <ul className="tips">{d.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
        </>
      )}

      {d.nearby?.length > 0 && (
        <>
          <h2>{t.nearby}</h2>
          <div className="chips">
            {d.nearby.map((n) => <span key={n} className="chip" aria-pressed="false">{n}</span>)}
          </div>
        </>
      )}

      {d.official?.length > 0 && (
        <>
          <h2>{t.official}</h2>
          <div className="official-links">
            {d.official.map((o) => (
              <a key={o.url} href={o.url} target="_blank" rel="noopener noreferrer">🔗 {o.name}</a>
            ))}
          </div>
        </>
      )}

      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
