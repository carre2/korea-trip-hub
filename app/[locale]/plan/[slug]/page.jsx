import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta } from "../../../../lib/seo";
import { fact } from "../../../../lib/facts";
import GuideVisual from "../../../../components/GuideVisual";
import TransitGuide from "../../../../components/TransitGuide";
import guideVisa from "../../../../data/guides/visa.json";
import guideTransit from "../../../../data/guides/transit.json";
import plan from "../../../../data/plan.json";
import planJa from "../../../../data/plan.ja.json";
import planZh from "../../../../data/plan.zh.json";
import planEs from "../../../../data/plan.es.json";
import planFr from "../../../../data/plan.fr.json";
import planDe from "../../../../data/plan.de.json";
import planPt from "../../../../data/plan.pt.json";
import planIt from "../../../../data/plan.it.json";
import planRu from "../../../../data/plan.ru.json";
import planKo from "../../../../data/plan.ko.json";
import planZhTW from "../../../../data/plan.zh-TW.json";
import planVi from "../../../../data/plan.vi.json";
import planTh from "../../../../data/plan.th.json";
import planId from "../../../../data/plan.id.json";
import planTr from "../../../../data/plan.tr.json";
import planFil from "../../../../data/plan.fil.json";
import planMs from "../../../../data/plan.ms.json";
import planHi from "../../../../data/plan.hi.json";
import planAr from "../../../../data/plan.ar.json";
import planBn from "../../../../data/plan.bn.json";

// Per-locale content overrides (tagline/intro/tips). Values/facts stay language-neutral.
const planI18n = { ja: planJa, zh: planZh, "zh-TW": planZhTW, es: planEs, fr: planFr, de: planDe, pt: planPt, it: planIt, ru: planRu, ko: planKo, vi: planVi, th: planTh, id: planId, tr: planTr, fil: planFil, ms: planMs, hi: planHi, ar: planAr, bn: planBn };

// Rich visual guides (English base). Keyed by slug; only slugs with a guide render the deep-dive layout.
const guides = { visa: guideVisa, transit: guideTransit };
// Which rich component renders each slug's guide body.
const GuideBody = { visa: GuideVisual, transit: TransitGuide };

// One static page per (locale × plan slug).
export function generateStaticParams() {
  const slugs = plan.order;
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const item = plan.items[params.slug];
  const title = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return pageMeta({
    locale,
    path: `plan/${params.slug}`,
    title: `${title} — Korea Trip Hub`,
    description: item?.tagline || "Verified travel essentials for visiting Korea.",
    type: "article",
  });
}

function humanize(k) {
  return k.replace(/_/g, " ");
}

/** Renders a verified fact only (HARNESS: never render TODO/STALE).
 *  Display text (claim/notes/labels/UI) comes from the active locale's messages
 *  when available, falling back to the English base in facts.json. */
function FactBlock({ id, m }) {
  const f = fact(id);
  if (!f) return null;
  const ui = m.factsUI || {};
  const labels = m.factLabels || {};
  const tr = (m.facts && m.facts[id]) || {};
  const claim = tr.claim || f.claim;
  const notes = tr.notes || f.notes;
  return (
    <div className="factbox">
      <div className="factbox-h">
        <b>{claim}</b>
        <span className="pill verified">✓ {f.verified}</span>
      </div>
      {f.value && (
        <ul className="factvals">
          {Object.entries(f.value).map(([k, v]) => (
            <li key={k}>
              <span>{labels[k] || humanize(k)}</span>
              <b>{typeof v === "boolean" ? (v ? "yes" : "no") : String(v)}</b>
            </li>
          ))}
        </ul>
      )}
      <div className="factsrc">
        {f.tier === "VOLATILE" && <span className="pill vol">{ui.confirm || "⚠ Confirm at source"}</span>}
        <span>{ui.source || "Source"}:{" "}
          <a href={f.source} target="_blank" rel="noopener noreferrer">{f.source_name}</a>
        </span>
        {notes && <p className="factnote">ⓘ {notes}</p>}
      </div>
    </div>
  );
}

export default function PlanArticle({ params }) {
  const locale = params?.locale || defaultLocale;
  const slug = params.slug;
  const base = plan.items[slug];
  const ov = planI18n[locale]?.items?.[slug] || {};
  const item = { ...base, ...ov }; // localized tagline/intro/tips override English base
  const m = getMessages(locale);
  const tile = m.plan.tiles[slug] || {};
  const title = tile.title || slug;

  const hasFacts = item.facts.some((id) => fact(id));
  const ui = m.factsUI || {};
  const guide = guides[slug];

  return (
    <article className="article">
      <a className="crumb" href={`/${locale}/#plan`}>← {m.nav.plan}</a>

      <div className="art-head">
        <span className="aic" style={{ background: item.color }}>{item.icon}</span>
        <h1>{title}</h1>
      </div>
      {guide && (
        <div className="art-meta">
          {guide.kicker && <span className="art-kicker">{guide.kicker}</span>}
          {guide.readingTime && <span className="art-read">⏱ {guide.readingTime}</span>}
        </div>
      )}
      <p className="art-tagline">{item.tagline}</p>

      {/* Hero image (real photo, credited) */}
      {guide?.hero?.img && (
        <figure className="art-hero">
          <img src={guide.hero.img} alt={guide.hero.alt} loading="eager" />
          {guide.hero.credit && (
            <figcaption>
              <a href={guide.hero.creditUrl} target="_blank" rel="noopener noreferrer">{guide.hero.credit}</a>
            </figcaption>
          )}
        </figure>
      )}

      {item.intro.map((p, i) => (
        <p key={i} className={i === 0 ? "" : "lead"}>{p}</p>
      ))}

      {/* TL;DR summary strip */}
      {guide?.tldr && (
        <div className="art-tldr">
          <span className="art-tldr-lbl">TL;DR</span>
          <ul>
            {guide.tldr.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      )}

      {/* Per-nationality visa guide hub */}
      {guide?.countryGuides && (
        <section className="gv-sec vcg-hub">
          <h2>{guide.countryGuides.title}</h2>
          <p className="gv-lead">{guide.countryGuides.intro}</p>

          {guide.countryGuides.needTitle && <h3 className="vcg-hub-sub">{guide.countryGuides.needTitle}</h3>}
          <div className="vcg-hub-grid">
            {guide.countryGuides.items.map((c) => (
              <a key={c.code} className="vcg-hub-card" href={`/${locale}/visa/${c.code}/`}>
                <span className="vcg-hub-flag">{c.flag}</span>
                <span className="vcg-hub-txt">
                  <b>{c.name} → Korea</b>
                  <em>{c.note}</em>
                </span>
                <span className="vcg-hub-arrow">→</span>
              </a>
            ))}
          </div>

          {guide.countryGuides.visaFree && (
            <>
              {guide.countryGuides.freeTitle && <h3 className="vcg-hub-sub">{guide.countryGuides.freeTitle}</h3>}
              <div className="vcg-hub-grid">
                {guide.countryGuides.visaFree.map((c) => (
                  <a key={c.code} className="vcg-hub-card vcg-hub-free" href={`/${locale}/visa/${c.code}/`}>
                    <span className="vcg-hub-flag">{c.flag}</span>
                    <span className="vcg-hub-txt">
                      <b>{c.name} → Korea</b>
                      <em>{c.note}</em>
                    </span>
                    <span className="vcg-hub-arrow">→</span>
                  </a>
                ))}
              </div>
            </>
          )}
          {guide.countryGuides.more && <p className="gv-legend">{guide.countryGuides.more}</p>}
        </section>
      )}

      {hasFacts && (
        <>
          <h2>✓ {ui.verified_facts || "Verified facts"}</h2>
          {item.facts.map((id) => (
            <FactBlock key={id} id={id} m={m} />
          ))}
        </>
      )}

      {/* Rich visual deep-dive (guide slugs only) */}
      {guide && (() => { const Body = GuideBody[slug]; return Body ? <Body guide={guide} /> : null; })()}

      {/* Generic tips/official links (non-guide slugs) */}
      {!guide && item.tips?.length > 0 && (
        <>
          <h2>{ui.good_to_know || "Good to know"}</h2>
          <ul className="tips">
            {item.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </>
      )}

      {!guide && item.official?.length > 0 && (
        <>
          <h2>{ui.official_sources || "Official sources"}</h2>
          <div className="official-links">
            {item.official.map((o) => (
              <a key={o.url} href={o.url} target="_blank" rel="noopener noreferrer">🔗 {o.name}</a>
            ))}
          </div>
        </>
      )}

      <p className="art-disclaimer">
        {m.footer.disclaimer}
      </p>
    </article>
  );
}
