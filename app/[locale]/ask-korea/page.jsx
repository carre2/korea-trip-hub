import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, faqLd, SITE_NAME } from "../../../lib/seo";
import { linkify } from "../../../lib/linkify";
import JsonLd from "../../../components/JsonLd";
import AskKoreaForm from "../../../components/AskKoreaForm";
import visaBase from "../../../data/guides/visa.json";
import visaI18n from "../../../data/guides/visa.i18n.json";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const t = getMessages(locale).askKorea;
  return pageMeta({
    locale,
    path: "ask-korea",
    title: `${t.metaTitle} — ${SITE_NAME}`,
    description: t.metaDescription,
  });
}

// The answered-question set is the visa & K-ETA hub FAQ — already fact-checked
// and translated per locale. ru/fr fall back to the English base when absent.
function faqForLocale(locale) {
  const loc = visaI18n[locale]?.faq?.items;
  if (loc && loc.length) return loc;
  return visaBase.faq?.items || [];
}

export default function AskKoreaPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const t = m.askKorea;
  const faqItems = faqForLocale(locale);

  return (
    <article className="article ask-page">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: t.title, path: "ask-korea" },
        ])}
      />
      {faqItems.length ? <JsonLd data={faqLd(faqItems, locale)} /> : null}
      <a className="crumb" href={`/${locale}/`}>← {m.brand}</a>
      <div className="ask-hero">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </div>

      {faqItems.length ? (
        <section className="ask-answers" aria-label={t.answersTitle}>
          <h2>{t.answersTitle}</h2>
          <p className="ask-answers-lead">{t.answersLead}</p>
          <div className="ask-faq">
            {faqItems.map((it, i) => (
              <details key={i} className="ask-faq-item">
                <summary>{it.q}</summary>
                <div className="ask-faq-a">{linkify(it.a)}</div>
              </details>
            ))}
          </div>
          <a className="ask-answers-more" href={`/${locale}/plan/visa/`}>
            {t.answersMore}
          </a>
        </section>
      ) : null}

      <div className="ask-guardrails" aria-label={t.howTitle}>
        <h2>{t.howTitle}</h2>
        <div className="ask-steps">
          <div><b>1</b><span>{t.step1}</span></div>
          <div><b>2</b><span>{t.step2}</span></div>
          <div><b>3</b><span>{t.step3}</span></div>
        </div>
      </div>

      <AskKoreaForm t={t} />
    </article>
  );
}
