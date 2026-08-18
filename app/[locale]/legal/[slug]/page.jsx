import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import { legalFor, legalSlugs } from "../../../../lib/legal";

const SLUGS = legalSlugs();
const CONTACT_EMAIL = "contact@ktriphub.com";

export function generateStaticParams() {
  return locales.flatMap((locale) => SLUGS.map((slug) => ({ locale, slug })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const p = legalFor(locale).pages[params.slug];
  const path = `legal/${params.slug}`;
  if (!p) return pageMeta({ locale, path, title: SITE_NAME });
  return pageMeta({ locale, path, title: `${p.title} — ${SITE_NAME}`, description: p.desc });
}

// Turn our contact email into a mailto link wherever it appears in body text.
function withEmail(text, key) {
  if (typeof text !== "string" || !text.includes(CONTACT_EMAIL)) return text;
  const parts = text.split(CONTACT_EMAIL);
  return parts.flatMap((seg, i) =>
    i === 0 ? [seg] : [<a key={`${key}-${i}`} href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, seg]
  );
}

export default function LegalPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const L = legalFor(locale);
  const p = L.pages[params.slug];
  const m = getMessages(locale);
  if (!p) return null;
  const f = m.footer || {};

  return (
    <article className="article legal">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: p.title, path: `legal/${params.slug}` },
        ])}
      />
      <a className="crumb" href={`/${locale}/`}>← {m.brand}</a>
      <div className="art-head">
        <h1>{p.title}</h1>
      </div>
      <div className="art-meta">
        <span className="art-read art-updated">🔄 {f.updatedLabel || "Updated"} {L.updated}</span>
      </div>
      <p className="art-tagline">{p.intro}</p>

      {p.sections.map((s, i) => (
        <section className="legal-sec" key={i}>
          {s.h && <h2>{s.h}</h2>}
          {s.body && s.body.map((para, j) => <p key={j}>{withEmail(para, `${i}-${j}`)}</p>)}
          {s.list && (
            <ul>
              {s.list.map((li, k) => <li key={k}>{li}</li>)}
            </ul>
          )}
        </section>
      ))}

      <nav className="legal-more" aria-label={f.morePolicies || "More policies"}>
        {SLUGS.filter((s) => s !== params.slug).map((s) => (
          <a key={s} href={`/${locale}/legal/${s}/`}>
            {(f.legalNav && f.legalNav[s]) || (L.pages[s] && L.pages[s].title) || s}
          </a>
        ))}
      </nav>
    </article>
  );
}
