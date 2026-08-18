import "../globals.css";
import Script from "next/script";
import { locales, rtlLocales, localeNames } from "../../lib/i18n";
import { SITE } from "../../lib/seo";
import Header from "../../components/Header";

// Google AdSense publisher (ktriphub.com). Loader below serves ads once approved.
const ADSENSE_CLIENT = "ca-pub-2067934281598769";
// Google Analytics 4 measurement ID (ktriphub.com property).
const GA_ID = "G-DZTSGKJ926";

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
        {/* AdSense loader PAUSED (2026-08-18): no live ad slots + no consent/CMP yet, so it
            only added privacy/perf cost with zero ad revenue. Re-enable together with the
            consent system and real <ins> slots (see IMPROVEMENT_PLAN_KO.md WS3).
        <Script
          id="adsbygoogle-init"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        /> */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
