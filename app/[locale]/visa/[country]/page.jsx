import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, faqLd } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import VisaCountryGuide from "../../../../components/VisaCountryGuide";
import { localized, visaCountryCodes } from "../../../../lib/visa";

export function generateStaticParams() {
  return locales.flatMap((locale) => visaCountryCodes.map((country) => ({ locale, country })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = localized(params.country, locale);
  const path = `visa/${params.country}`;
  if (!g) return pageMeta({ locale, path, title: "Visa guide — Korea Trip Hub" });
  const title = g.metaTitle || `${g.country} → Korea Visa: Step-by-Step Guide (2026) — Korea Trip Hub`;
  const description = g.metaDesc || `How to apply for a Korea tourist visa from ${g.country}: where to go, documents (and where to get each), fees, processing time and official links. ${g.verdict?.type || ""}`.trim();
  return pageMeta({ locale, path, title, description, type: "article" });
}

export default function VisaCountryPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = localized(params.country, locale);
  const m = getMessages(locale);
  if (!g) return null;
  const ui = g.ui || {};

  return (
    <article className="article">
      <JsonLd
        data={[
          breadcrumbLd(locale, [
            { name: m.brand, path: "" },
            { name: m.plan?.tiles?.visa?.title || "Visa & K-ETA", path: "plan/visa" },
            { name: g.country, path: `visa/${params.country}` },
          ]),
          articleLd({
            locale,
            path: `visa/${params.country}`,
            headline: g.h1 || `Korea Visa from ${g.country}`,
            description: g.metaDesc,
            image: g.hero?.img,
            dateModified: g.updated,
          }),
          faqLd(g.faq?.items, locale),
        ]}
      />
      <a className="crumb" href={`/${locale}/plan/visa/`}>← {m.nav?.plan || "Plan Trip"} · Visa</a>

      <div className="art-head">
        <span className="aic vcg-flagbox">{g.flag}</span>
        <h1>{g.h1 || `Korea Visa from ${g.country}`}</h1>
      </div>
      <div className="art-meta">
        {g.kicker && <span className="art-kicker">{g.kicker}</span>}
        {g.readingTime && <span className="art-read">⏱ {g.readingTime}</span>}
        {g.updated && <span className="art-read">· {ui.updated || "Updated"} {g.updated}</span>}
      </div>

      {g.hero?.img && (
        <figure className="art-hero">
          <img src={g.hero.img} alt={g.hero.alt} loading="eager" />
          {g.hero.credit && (
            <figcaption>
              <a href={g.hero.creditUrl} target="_blank" rel="noopener noreferrer">{g.hero.credit}</a>
            </figcaption>
          )}
        </figure>
      )}

      {g.tldr && (
        <div className="art-tldr">
          <span className="art-tldr-lbl">{ui.tldr || "TL;DR"}</span>
          <ul>{g.tldr.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}

      <VisaCountryGuide guide={g} m={m} />

      <p className="art-disclaimer">{m.footer?.disclaimer}</p>
    </article>
  );
}
