import "../globals.css";
import { locales, rtlLocales, localeNames } from "../../lib/i18n";
import { SITE } from "../../lib/seo";
import Header from "../../components/Header";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Only metadataBase belongs here. canonical/hreflang are PER PAGE (lib/seo.js pageMeta) —
// a canonical set in this layout would be inherited by every child page that doesn't
// override it, telling Google the whole site is a copy of the locale home.
export function generateMetadata() {
  return { metadataBase: new URL(SITE) };
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
