import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import VisaCountryGuide from "../../../../components/VisaCountryGuide";
import india from "../../../../data/visa/india.json";

// Per-nationality visa guides. Add a country here + a data/visa/<code>.json file.
const countries = { india };

export function generateStaticParams() {
  const codes = Object.keys(countries);
  return locales.flatMap((locale) => codes.map((country) => ({ locale, country })));
}

export function generateMetadata({ params }) {
  const g = countries[params.country];
  if (!g) return { title: "Visa guide — Korea Trip Hub" };
  return {
    title: `${g.country} → Korea Visa: Step-by-Step Guide (2026) — Korea Trip Hub`,
    description: `How to apply for a Korea tourist visa from ${g.country}: where to go, documents (and where to get each), fees, processing time and official links. ${g.verdict?.type || ""}`.trim(),
  };
}

export default function VisaCountryPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = countries[params.country];
  const m = getMessages(locale);
  if (!g) return null;

  return (
    <article className="article">
      <a className="crumb" href={`/${locale}/plan/visa/`}>← {m.nav?.plan || "Plan Trip"} · Visa</a>

      <div className="art-head">
        <span className="aic vcg-flagbox">{g.flag}</span>
        <h1>Korea Visa from {g.country}</h1>
      </div>
      <div className="art-meta">
        {g.kicker && <span className="art-kicker">{g.kicker}</span>}
        {g.readingTime && <span className="art-read">⏱ {g.readingTime}</span>}
        {g.updated && <span className="art-read">· Updated {g.updated}</span>}
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
          <span className="art-tldr-lbl">TL;DR</span>
          <ul>{g.tldr.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}

      <VisaCountryGuide guide={g} />

      <p className="art-disclaimer">{m.footer?.disclaimer}</p>
    </article>
  );
}
