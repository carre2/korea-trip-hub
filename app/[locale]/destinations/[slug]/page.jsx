import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, touristAttractionLd, SITE_NAME } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import { fact } from "../../../../lib/facts";
import BookCTA from "../../../../components/BookCTA";
import Stay22Map from "../../../../components/Stay22Map";
import { klookSearch } from "../../../../lib/booking";
import dest from "../../../../data/destinations.json";
import stayData from "../../../../data/stay.json";
import { stayFor } from "../../../../lib/content";
import destImages from "../../../../data/dest-images.json";
import ArticleTrust from "../../../../components/ArticleTrust";
import destJa from "../../../../data/destinations.ja.json";
import destZh from "../../../../data/destinations.zh.json";
import destEs from "../../../../data/destinations.es.json";
import destFr from "../../../../data/destinations.fr.json";
import destDe from "../../../../data/destinations.de.json";
import destPt from "../../../../data/destinations.pt.json";
import destIt from "../../../../data/destinations.it.json";
import destRu from "../../../../data/destinations.ru.json";
import destKo from "../../../../data/destinations.ko.json";
import destZhTW from "../../../../data/destinations.zh-TW.json";
import destVi from "../../../../data/destinations.vi.json";
import destTh from "../../../../data/destinations.th.json";
import destId from "../../../../data/destinations.id.json";
import destTr from "../../../../data/destinations.tr.json";
import destFil from "../../../../data/destinations.fil.json";
import destMs from "../../../../data/destinations.ms.json";
import destHi from "../../../../data/destinations.hi.json";
import destAr from "../../../../data/destinations.ar.json";
import destBn from "../../../../data/destinations.bn.json";

const destI18n = { ja: destJa, zh: destZh, "zh-TW": destZhTW, es: destEs, fr: destFr, de: destDe, pt: destPt, it: destIt, ru: destRu, ko: destKo, vi: destVi, th: destTh, id: destId, tr: destTr, fil: destFil, ms: destMs, hi: destHi, ar: destAr, bn: destBn };

export function generateStaticParams() {
  const slugs = Object.keys(dest.items);
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  // Same English-base + locale-override merge the page body uses, so the tab title and the
  // search snippet are in the reader's language, not English.
  const d = { ...dest.items[params.slug], ...(destI18n[locale]?.items?.[params.slug] || {}) };
  // SEO: add the city keyword to the title (people search "<place> <city>") and use the
  // richer first intro paragraph as the description (higher relevance + click-through).
  // Prefer the localized city name (from the stay guides) so CJK titles read natively.
  const cityName =
    stayFor(locale).cities[d.city]?.name ||
    (dest.cities.find((c) => c.key === d.city) || {}).name;
  const name = d.name || "Destination";
  return pageMeta({
    locale,
    path: `destinations/${params.slug}`,
    title: cityName ? `${name}, ${cityName} — ${SITE_NAME}` : `${name} — ${SITE_NAME}`,
    description: (Array.isArray(d.intro) && d.intro[0]) || d.blurb,
    type: "article",
  });
}

export default function DestinationDetail({ params }) {
  const locale = params?.locale || defaultLocale;
  const d = { ...dest.items[params.slug], ...(destI18n[locale]?.items?.[params.slug] || {}) };
  const img = destImages[params.slug];
  const m = getMessages(locale);
  const t = m.dest;
  const ui = m.factsUI || {};
  const f = d.factId ? fact(d.factId) : null;
  const trFact = (m.facts && m.facts[d.factId]) || {};
  // Related: up to 3 other attractions in the same city, with localized names.
  const related = Object.keys(dest.items)
    .filter((s) => s !== params.slug && dest.items[s].city === d.city)
    .slice(0, 3)
    .map((s) => ({
      href: `/${locale}/destinations/${s}/`,
      label: destI18n[locale]?.items?.[s]?.name || dest.items[s].name,
    }));

  return (
    <article className="article">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: t.title, path: "destinations" },
          { name: d.name, path: `destinations/${params.slug}` },
        ])}
      />
      <JsonLd
        data={touristAttractionLd({
          locale,
          path: `destinations/${params.slug}`,
          name: d.name,
          description: d.blurb,
          cityName: (dest.cities.find((c) => c.key === d.city) || {}).name,
          image: img?.img,
        })}
      />
      <a className="crumb" href={`/${locale}/destinations/`}>← {t.browseAll}</a>

      <div className="art-head">
        <span className="aic" style={{ background: d.grad }}>{d.icon}</span>
        <h1>{d.name}</h1>
      </div>
      <p className="art-tagline">{d.blurb}</p>

      {img?.img && (
        <figure className="art-hero">
          <img src={img.img} alt={d.name} width={1280} height={853} loading="eager" />
          {img.credit && (
            <figcaption>
              <a href={img.creditUrl} target="_blank" rel="noopener noreferrer">{img.credit}</a>
            </figcaption>
          )}
        </figure>
      )}

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

      <BookCTA
        partner="klook"
        icon="🎟️"
        label="Book tours, tickets & experiences"
        sub={`Skip-the-line entry, hanbok rental & day trips${(dest.cities.find((c) => c.key === d.city) || {}).name ? ` around ${(dest.cities.find((c) => c.key === d.city) || {}).name}` : ""}`}
        url={klookSearch(d.name)}
        disclose
      />

      {stayData.cities[d.city] && (
        <p style={{ margin: "2px 0 0" }}>
          <a href={`/${locale}/stay/${d.city}/`} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
            🏨 Where to stay in {stayData.cities[d.city].name} →
          </a>
        </p>
      )}

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

      <Stay22Map place={`${d.name}, South Korea`} heading={m.hotelsNearby} />
      <ArticleTrust locale={locale} related={related} />
      <p className="art-disclaimer">{m.footer.disclaimer}</p>
    </article>
  );
}
