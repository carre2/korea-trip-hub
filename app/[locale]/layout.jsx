import "../globals.css";
import Script from "next/script";
import { locales, rtlLocales, localeNames, getMessages } from "../../lib/i18n";
import { SITE } from "../../lib/seo";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import ConsentBanner from "../../components/ConsentBanner";

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
  const m = getMessages(locale);
  const consent = m.consent || {};
  return (
    <html lang={locale} dir={dir}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header locale={locale} nav={m.nav} locales={locales} localeNames={localeNames} rtl={dir === "rtl"} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} />
        <ConsentBanner t={consent} privacyHref={`/${locale}/legal/privacy/`} />
        {/* Google Consent Mode v2 — every signal denied by default until the visitor opts
            in via the banner above (or a stored choice is re-applied). Runs before GA reads
            config, so analytics stay cookieless until consent. */}
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js', new Date());
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('kth_consent')==='granted')gtag('consent','update',{analytics_storage:'granted'});}catch(e){}
gtag('config','${GA_ID}');`}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        {/* AdSense loader PAUSED (2026-08-18): no live ad slots + no ad-consent UI yet, so it
            only added privacy/perf cost with zero ad revenue. Re-enable with real <ins> slots
            and ad_storage consent (see IMPROVEMENT_PLAN_KO.md WS3). Publisher: ADSENSE_CLIENT. */}
      </body>
    </html>
  );
}
