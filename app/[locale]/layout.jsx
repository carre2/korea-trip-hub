import "../globals.css";
import { locales, rtlLocales, localeNames } from "../../lib/i18n";
import Header from "../../components/Header";

const SITE = "https://ktriphub.com";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Per-locale metadata + hreflang alternates (multilingual SEO).
export function generateMetadata({ params }) {
  const { locale } = params;
  const languages = Object.fromEntries(locales.map((l) => [l, `${SITE}/${l}/`]));
  languages["x-default"] = `${SITE}/en/`;
  return {
    metadataBase: new URL(SITE),
    alternates: { canonical: `${SITE}/${locale}/`, languages },
  };
}

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body>
        <Header locale={locale} />
        {children}
      </body>
    </html>
  );
}
