import "../globals.css";
import "../experience.css";
import Script from "next/script";
import { locales, rtlLocales, localeNames, getMessages } from "../../lib/i18n";
import { SITE } from "../../lib/seo";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import ConsentBanner from "../../components/ConsentBanner";
import ExperienceProvider from "../../components/ExperienceProvider";
import ArticleContents from "../../components/ArticleContents";
import JourneyAnalytics from "../../components/JourneyAnalytics";
import ChatWidget from "../../components/ChatWidget";

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
        <ExperienceProvider labels={{...m.experience, affiliate: m.footer.affiliateLine}}>
        <a className="skip-link" href="#main">{m.experience.skip}</a>
        <Header locale={locale} nav={m.nav} labels={m.experience} locales={locales} localeNames={localeNames} rtl={dir === "rtl"} />
        <JourneyAnalytics locale={locale} /><main id="main"><ArticleContents label={m.experience.contents} />{children}</main>
        <SiteFooter locale={locale} />
        <ChatWidget locale={locale} labels={m.chat} />
        <ConsentBanner t={consent} privacyHref={`/${locale}/legal/privacy/`} />
        {/* Google Consent Mode v2 — every signal denied by default until the visitor opts
            in via the banner above (or a stored choice is re-applied). Runs before GA reads
            config, so analytics stay cookieless until consent. */}
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('js', new Date());
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('kth_consent')==='granted')gtag('consent','update',{analytics_storage:'granted'});}catch(e){}
if(['ktriphub.com','www.ktriphub.com'].includes(location.hostname))gtag('config','${GA_ID}');`}
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
      </ExperienceProvider>
      </body>
    </html>
  );
}
