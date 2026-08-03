import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { fact } from "../../../../lib/facts";
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

// Per-locale content overrides (tagline/intro/tips). Values/facts stay language-neutral.
const planI18n = { ja: planJa, zh: planZh, "zh-TW": planZhTW, es: planEs, fr: planFr, de: planDe, pt: planPt, it: planIt, ru: planRu, ko: planKo, vi: planVi, th: planTh, id: planId, tr: planTr, fil: planFil, ms: planMs };

// One static page per (locale × plan slug).
export function generateStaticParams() {
  const slugs = plan.order;
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const item = plan.items[params.slug];
  const title = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return {
    title: `${title} — Korea Trip Hub`,
    description: item?.tagline || "Verified travel essentials for visiting Korea.",
  };
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

  return (
    <article className="article">
      <a className="crumb" href={`/${locale}/#plan`}>← {m.nav.plan}</a>

      <div className="art-head">
        <span className="aic" style={{ background: item.color }}>{item.icon}</span>
        <h1>{title}</h1>
      </div>
      <p className="art-tagline">{item.tagline}</p>

      {item.intro.map((p, i) => (
        <p key={i} className={i === 0 ? "" : "lead"}>{p}</p>
      ))}

      {hasFacts && (
        <>
          <h2>✓ {ui.verified_facts || "Verified facts"}</h2>
          {item.facts.map((id) => (
            <FactBlock key={id} id={id} m={m} />
          ))}
        </>
      )}

      {item.tips?.length > 0 && (
        <>
          <h2>{ui.good_to_know || "Good to know"}</h2>
          <ul className="tips">
            {item.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </>
      )}

      {item.official?.length > 0 && (
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
