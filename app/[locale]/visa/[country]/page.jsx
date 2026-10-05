import EntryGuidance from "../../../../components/EntryGuidance";
import ArrivalSteps from "../../../../components/ArrivalSteps";
import { locales, getMessages, defaultLocale } from "../../../../lib/i18n";
import { pageMeta, breadcrumbLd, articleLd, faqLd } from "../../../../lib/seo";
import JsonLd from "../../../../components/JsonLd";
import VisaCountryGuide from "../../../../components/VisaCountryGuide";
import VisaPhotoSpec from "../../../../components/VisaPhotoSpec";
import VisaLocalInfo from "../../../../components/VisaLocalInfo";
import NextSteps from "../../../../components/NextSteps";
import visaLocal from "../../../../data/visa-local.json";
import ArticleTrust from "../../../../components/ArticleTrust";
import { localized, visaCountryCodes } from "../../../../lib/visa";
import searchCopy from '../../../../data/search-copy.json';
import { visaSearchMetadata } from '../../../../lib/search-metadata.mjs';

export function generateStaticParams() {
  return locales.flatMap((locale) => visaCountryCodes.map((country) => ({ locale, country })));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = localized(params.country, locale);
  const path = `visa/${params.country}`;
  if (!g) return pageMeta({ locale, path, title: "Visa guide — Korea Trip Hub" });
  const {title, description} = visaSearchMetadata(g, params.country, locale, searchCopy[locale] || searchCopy.en);
  return pageMeta({ locale, path, title, description, type: "article" });
}

export default function VisaCountryPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const g = localized(params.country, locale);
  const m = getMessages(locale);
  if (!g) return null;
  const ui = g.ui || {};

  return (
    <article className="article entry-country">
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
      <a className="crumb" href={`/${locale}/plan/visa/`}>← {m.plan?.tiles?.visa?.title || "Visa & K-ETA"}</a>

      <div className="art-head">
        <span className="aic vcg-flagbox">{g.flag}</span>
        <h1>{g.h1 || `Korea Visa from ${g.country}`}</h1>
      </div>
      <div className="art-meta">
        {g.kicker && <span className="art-kicker">{g.kicker}</span>}
        {g.readingTime && <span className="art-read">⏱ {g.readingTime}</span>}
        {g.updated && <span className="art-read">· {ui.updated || "Updated"} {g.updated}</span>}
      </div>

      {g.tldr && (
        <div className="art-tldr">
          <span className="art-tldr-lbl">{ui.tldr || "TL;DR"}</span>
          <ul>{g.tldr.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}

      {g.hero?.img && (
        <figure className="art-hero">
          <img src={g.hero.img} alt={g.hero.alt} width="1280" height="960" loading="lazy" />
          {g.hero.credit && (
            <figcaption>
              <a href={g.hero.creditUrl} target="_blank" rel="noopener noreferrer">{g.hero.credit}</a>
            </figcaption>
          )}
        </figure>
      )}

      {!g.entryNotice && <EntryGuidance locale={locale} compact />}
      <VisaCountryGuide guide={g} m={m} />

      {g.verdict?.need && <VisaPhotoSpec m={m} />}

      {g.verdict?.need && visaLocal[params.country] && (
        <VisaLocalInfo
          cur={visaLocal[params.country].currency}
          embassy={visaLocal[params.country].embassy}
          labels={m.visaLocal}
        />
      )}

      <ArrivalSteps locale={locale} m={{experience:m.experience,plan:m.plan}} placement="visa-country" />
      <NextSteps locale={locale} m={m} country={params.country} countryTitle={g.country} />

      <ArticleTrust locale={locale} reviewed={g.updated || null} showVerifiedNote={false} />
      <p className="art-disclaimer">{m.footer?.disclaimer}</p>
    </article>
  );
}
