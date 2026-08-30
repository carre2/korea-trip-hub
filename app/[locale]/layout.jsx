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
        {/* AdSense loader — the code Google needs to find on visited pages to review/approve
            the site (a paused loader was the likely cause of ktriphub sitting in "Getting
            ready" past 4 weeks; re-enabled 2026-08-26). Loads AFTER the Consent Mode default
            (ad_storage denied by default above), so it stays GDPR-compliant; no <ins> ad slots
            are placed yet, so no ads render — only the code is present for review. */}
        <Script
          id="adsense"
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
        {/* Stay22 LinkSwap (ACTIVE 2026-08-26 — Stay22 approved). Turns existing hotel links
            into commission-earning partner links (Booking.com/Hotels.com/Agoda/Expedia/…).
            Loads after the Consent Mode default above; disclosed on the Affiliate & Privacy
            pages. Pairs with <Stay22Map> (STAY22.aid in lib/booking.js). */}
        <Script id="stay22-init" strategy="afterInteractive">
          {`window.Stay22=window.Stay22||{};window.Stay22.params={lmaID:'6a8fd38afdad71da9008a52b'};`}
        </Script>
        <Script src="https://scripts.stay22.com/letmeallez.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
