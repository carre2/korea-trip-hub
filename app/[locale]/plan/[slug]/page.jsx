import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { fact } from "../../../../lib/facts";
import plan from "../../../../data/plan.json";

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

/** Renders a verified fact only (HARNESS: never render TODO/STALE). */
function FactBlock({ id }) {
  const f = fact(id);
  if (!f) return null;
  return (
    <div className="factbox">
      <div className="factbox-h">
        <b>{f.claim}</b>
        <span className="pill verified">✓ {f.verified}</span>
      </div>
      {f.value && (
        <ul className="factvals">
          {Object.entries(f.value).map(([k, v]) => (
            <li key={k}>
              <span>{humanize(k)}</span>
              <b>{typeof v === "boolean" ? (v ? "yes" : "no") : String(v)}</b>
            </li>
          ))}
        </ul>
      )}
      <div className="factsrc">
        {f.tier === "VOLATILE" && <span className="pill vol">⚠ Prices/rules change — confirm at source</span>}
        <span>Source:{" "}
          <a href={f.source} target="_blank" rel="noopener noreferrer">{f.source_name}</a>
        </span>
        {f.notes && <p className="factnote">ⓘ {f.notes}</p>}
      </div>
    </div>
  );
}

export default function PlanArticle({ params }) {
  const locale = params?.locale || defaultLocale;
  const slug = params.slug;
  const item = plan.items[slug];
  const m = getMessages(locale);
  const tile = m.plan.tiles[slug] || {};
  const title = tile.title || slug;

  const hasFacts = item.facts.some((id) => fact(id));

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
          <h2>✓ Verified facts</h2>
          {item.facts.map((id) => (
            <FactBlock key={id} id={id} />
          ))}
        </>
      )}

      {item.tips?.length > 0 && (
        <>
          <h2>Good to know</h2>
          <ul className="tips">
            {item.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </>
      )}

      {item.official?.length > 0 && (
        <>
          <h2>Official sources</h2>
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
