import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import AskKoreaForm from "../../../components/AskKoreaForm";

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

export default function AskKoreaPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const t = m.askKorea;

  return (
    <article className="article ask-page">
      <JsonLd
        data={breadcrumbLd(locale, [
          { name: m.brand, path: "" },
          { name: t.title, path: "ask-korea" },
        ])}
      />
      <a className="crumb" href={`/${locale}/`}>← {m.brand}</a>
      <div className="ask-hero">
        <span className="eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </div>

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
