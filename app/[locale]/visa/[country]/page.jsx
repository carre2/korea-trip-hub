import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import VisaCountryGuide from "../../../../components/VisaCountryGuide";
import india from "../../../../data/visa/india.json";
import vietnam from "../../../../data/visa/vietnam.json";
import china from "../../../../data/visa/china.json";
import philippines from "../../../../data/visa/philippines.json";
import indonesia from "../../../../data/visa/indonesia.json";
import indiaI18n from "../../../../data/visa/india.i18n.json";
import vietnamI18n from "../../../../data/visa/vietnam.i18n.json";
import chinaI18n from "../../../../data/visa/china.i18n.json";
import philippinesI18n from "../../../../data/visa/philippines.i18n.json";
import indonesiaI18n from "../../../../data/visa/indonesia.i18n.json";

// Per-nationality visa guides. Add a country here + a data/visa/<code>.json file.
const countries = { india, vietnam, china, philippines, indonesia };
// Per-locale translation overrides, one file per country: { <locale>: { ...overrides } }.
const i18nMaps = { india: indiaI18n, vietnam: vietnamI18n, china: chinaI18n, philippines: philippinesI18n, indonesia: indonesiaI18n };

// Deep-merge a locale override onto the English base.
// Arrays in the override REPLACE the base array (a locale provides the full translated array);
// plain objects merge recursively; scalars override. Missing keys fall back to English.
function mergeGuide(base, ov) {
  if (!ov) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(ov)) {
    const bv = base?.[k], ovv = ov[k];
    if (Array.isArray(ovv)) out[k] = ovv;
    else if (ovv && typeof ovv === "object" && bv && typeof bv === "object" && !Array.isArray(bv)) out[k] = mergeGuide(bv, ovv);
    else out[k] = ovv;
  }
  return out;
}

function localized(country, locale) {
  const base = countries[country];
  if (!base) return null;
  return mergeGuide(base, i18nMaps[country]?.[locale]);
}

export function generateStaticParams() {
  const codes = Object.keys(countries);
  return locales.flatMap((locale) => codes.map((country) => ({ locale, country })));
}

export function generateMetadata({ params }) {
  const g = localized(params.country, params.locale);
  if (!g) return { title: "Visa guide — Korea Trip Hub" };
  const title = g.metaTitle || `${g.country} → Korea Visa: Step-by-Step Guide (2026) — Korea Trip Hub`;
  const description = g.metaDesc || `How to apply for a Korea tourist visa from ${g.country}: where to go, documents (and where to get each), fees, processing time and official links. ${g.verdict?.type || ""}`.trim();
  return { title, description };
}

export default function VisaCountryPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = localized(params.country, locale);
  const m = getMessages(locale);
  if (!g) return null;
  const ui = g.ui || {};

  return (
    <article className="article">
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

      <VisaCountryGuide guide={g} />

      <p className="art-disclaimer">{m.footer?.disclaimer}</p>
    </article>
  );
}
