import { locales, getMessages, defaultLocale } from "../../../lib/i18n";
import { pageMeta, breadcrumbLd, SITE_NAME } from "../../../lib/seo";
import JsonLd from "../../../components/JsonLd";
import PlaceReportSearch from "../../../components/PlaceReportSearch";
import PlaceReport from "../../../components/PlaceReport";
import copyAll from "../../../data/place-report-ui.json";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const t = (copyAll[locale] || copyAll.en).search;
  return pageMeta({
    locale,
    path: "report",
    title: `${t.title} — ${SITE_NAME}`,
    description: t.sub,
  });
}

export default function ReportPage({ params }) {
  const locale = params?.locale || defaultLocale;
  const t = copyAll[locale] || copyAll.en;
  return (
    <>
      <JsonLd data={breadcrumbLd(locale, [{ name: SITE_NAME, path: "" }, { name: t.search.title, path: "report" }])} />
      <main className="report-page">
        <PlaceReportSearch locale={locale} level={1} />
        <PlaceReport locale={locale} />
      </main>
    </>
  );
}
