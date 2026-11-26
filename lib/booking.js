// Central booking / affiliate config.
// Klook is LIVE (redirect-style links). Agoda/others fill in later.
//
//   Klook   -> https://affiliate.klook.com/redirect?aid=..&aff_adid=..&k_site=<encoded dest>
//   Agoda   -> appends ?cid=<id>   (fill AFF.agoda when you join Agoda Partners)
//   Trip.com-> appends the full param string in AFF.tripcom
//   Trazy   -> appends ?utm_source=<id>

// Klook affiliate credentials (public tracking IDs — safe to ship).
export const KLOOK = { aid: "130139", adid: "1372119" };

// Klook interface-language path segment per site locale. The affiliate tracking
// lives in the redirect wrapper (aid/adid), so switching the destination's
// language segment never affects commission. Unmapped locales fall back to
// en-US. Covers the markets Klook ships a localized UI for; es/fr/ru included
// as Klook's European locales.
const KLOOK_LOCALE = { en: "en-US", ko: "ko", ja: "ja", zh: "zh-CN", "zh-TW": "zh-TW", th: "th", vi: "vi", id: "id", es: "es", fr: "fr", ru: "ru" };
function klookLocale(locale) { return KLOOK_LOCALE[locale] || "en-US"; }

// Other partners' affiliate IDs — empty until a program is APPROVED.
// Agoda: application was rejected 2026-08-26 (generic "reapply when more
// developed" template — typical for a new, low-traffic site). Until Agoda
// approves us, we do NOT attach their cid: leaving AFF.agoda empty makes
// withAff() a no-op, so Agoda hotel links ship as plain, non-commission
// links (still useful to readers, and honest). Saved cid to re-enable on
// approval: agoda = "1972168" (Agoda Partner Center, site ktriphub.com).
// ★ON APPROVAL also localize in the same change (user request 2026-11-26):
//   Agoda localizes by the browser Accept-Language header (verified: an "Accept-
//   Language: ja-JP" request returns lang="ja"), so it AUTO-localizes like Google
//   Maps — a URL ?locale= is ignored. So Agoda needs NO locale code; just set cid.
//   Trip.com localizes by SUBDOMAIN (verified: jp.trip.com -> lang="ja-JP"), so on
//   approval localize tripHotels() with a locale->subdomain map (ja=jp, ko=kr,
//   zh-TW=tw, zh=cn?, vi=vn, th=th, id=id, ms=my, es/fr/ru=that code, en=www).
//   NB both are currently DORMANT (agodaCity/tripHotels aren't rendered anywhere —
//   Stay22 is the live hotel path), so there is nothing to localize until the
//   links are wired into a page again.
// creatrip is LIVE (approved 2026-11-19) — see the Creatrip block below.
export const AFF = { agoda: "", tripcom: "", trazy: "", creatrip: "AFF-zzm1bt3" };

// Shown near booking links (FTC-style disclosure — keep it visible).
export const DISCLOSURE =
  "Some links here are partner links — if you book through them we may earn a small commission, at no extra cost to you. We only list services we'd point a friend to.";

// Wrap any Klook destination URL in the affiliate redirect (no-op if no aid).
function klookAff(destUrl) {
  if (!KLOOK.aid) return destUrl;
  return `https://affiliate.klook.com/redirect?aid=${KLOOK.aid}&aff_adid=${KLOOK.adid}&k_site=${encodeURIComponent(destUrl)}`;
}

// Klook search results for a query (returns a ready affiliate link).
// `locale` is the site locale — the results open in the visitor's language.
export function klookSearch(q, locale) {
  return klookAff(`https://www.klook.com/${klookLocale(locale)}/search/result/?query=${encodeURIComponent(q)}`);
}
// Wrap a specific Klook page (city/activity) as an affiliate link. When `locale`
// is given, the destination's leading language segment is swapped to match
// (no-op if the URL has no such segment); without it the URL is left untouched.
export function klookUrl(destUrl, locale) {
  let url = destUrl;
  if (locale && typeof url === "string") {
    url = url.replace(/^(https?:\/\/(?:www\.)?klook\.com)\/[a-zA-Z]{2}(?:-[a-zA-Z]{2})?\//, `$1/${klookLocale(locale)}/`);
  }
  return klookAff(url);
}

// --- Creatrip (Korea experiences — K-beauty, hair salons, skin clinics, K-pop
// music shows, hanbok rental, photo studios). LIVE since 2026-11-19; the code
// lives in AFF.creatrip above, so withAff(url,"creatrip") and
// <BookCTA partner="creatrip"> both produce a valid link.
// A Creatrip affiliate link is just a plain creatrip.com URL with
// ?utm_source=AFF-<code> appended — exactly what their own link bar generates.
// Rules: credited only when booked within 30 days of the click AND on the same
// browser; finalised once the booking is used; payout when the balance tops
// ~KRW 50,000. Rate is 8% base and up to 40% on deposit bookings, and varies per
// product (shown top-right on each Creatrip product page). Links default to the
// /en/ site, which works for every locale — swap in a matched Creatrip locale
// slug only after confirming that slug exists, or the link 404s.
// Creatrip language path segment per site locale. Verified 2026-11-26: Creatrip
// ships en/ja/zh-TW/th/vi/id/es/fr/ru; zh (Simplified), ms and ko have no
// Creatrip locale, so they fall back to en.
const CREATRIP_LOCALE = { en: "en", ja: "ja", "zh-TW": "zh-TW", th: "th", vi: "vi", id: "id", es: "es", fr: "fr", ru: "ru" };
// Swap a creatrip.com URL's leading language segment to the visitor's (no-op if
// the URL has no such segment). Does NOT append the affiliate param — pass the
// result through withAff()/BookCTA, which add ?utm_source as usual.
export function creatripLocalize(url, locale) {
  if (!locale || typeof url !== "string") return url;
  const seg = CREATRIP_LOCALE[locale] || "en";
  return url.replace(/^(https?:\/\/(?:www\.)?creatrip\.com)\/[a-zA-Z]{2}(?:-[a-zA-Z]{2})?\//, `$1/${seg}/`);
}
export function creatripUrl(destUrl, locale) {
  return withAff(creatripLocalize(destUrl, locale), "creatrip");
}

// Curated Creatrip destinations for the K-beauty / K-wave sections. Clean path
// URLs (no query string) so the tracking param always appends cleanly. Confirm a
// URL still resolves before adding it here.
export const CREATRIP_DEST = {
  beautyServices: "https://creatrip.com/en/landing-area/4", // K-beauty hub: hair · makeup · skin
};

// Append the affiliate parameter for non-Klook partners (no-op until an ID is set).
export function withAff(url, partner) {
  const id = AFF[partner];
  if (!id) return url;
  const sep = url.includes("?") ? "&" : "?";
  if (partner === "agoda") return `${url}${sep}cid=${id}`;
  if (partner === "tripcom") return `${url}${sep}${id}`;
  return `${url}${sep}utm_source=${id}`;
}

// Agoda city landing pages (stable). Affiliate cid appended once AFF.agoda is set.
const AGODA_CITY = {
  seoul: "https://www.agoda.com/city/seoul-kr.html",
  busan: "https://www.agoda.com/city/busan-kr.html",
  jeju: "https://www.agoda.com/city/jeju-island-kr.html",
  gyeongju: "https://www.agoda.com/city/gyeongju-si-kr.html",
  jeonju: "https://www.agoda.com/city/jeonju-si-kr.html",
  gangneung: "https://www.agoda.com/city/gangneung-si-kr.html",
  suwon: "https://www.agoda.com/city/suwon-si-kr.html",
  incheon: "https://www.agoda.com/city/incheon-kr.html",
  sokcho: "https://www.agoda.com/city/sokcho-kr.html",
};
export function agodaCity(key) {
  return AGODA_CITY[key] || "https://www.agoda.com/country/south-korea.html";
}

// --- Trip.com (hotels; strong Asia/Korea inventory) -------------------------
// Ready-to-activate slot. Trip.com's affiliate program gives you a tracking
// string (Allianceid/SID) on approval — put it in TRIP.pid and hotel links
// route through Trip.com. Empty pid => plain Trip.com link (no commission yet).
export const TRIP = { pid: "" };
export function tripHotels(cityName) {
  const base = `https://www.trip.com/hotels/?searchKeyword=${encodeURIComponent(cityName || "South Korea")}`;
  return TRIP.pid ? `${base}&${TRIP.pid}` : base;
}

// --- Stay22 (map widget aggregating Booking.com / Hotels.com / etc.) --------
// Address-based hotel map — no per-city IDs needed. While aid is empty,
// <Stay22Map> renders nothing (no third-party embed loads), so it's inert.
//
// READY (held OFF until AdSense first approval — user decision 2026-08-26):
//   Stay22 LetMeAllez ID for ktriphub.com = "6a8fd38afdad71da9008a52b".
//   To activate: (1) set aid below to that value; (2) enable the LinkSwap
//   <Script> block in app/[locale]/layout.jsx; (3) update the Advertising &
//   Affiliate + Privacy pages in all 12 locales — hotel links then EARN via
//   Stay22 partners (Booking.com/Hotels.com/Agoda/Expedia/…), so "no commission"
//   copy must change and Stay22 must be disclosed as a data processor.
// ACTIVE: approved tracking ID. Maps load on request; direct Allez links carry
// attribution explicitly. No global LinkSwap script is required or installed.
export const STAY22 = { aid: "6a8fd38afdad71da9008a52b" };
// Direct hotel links use Allez so attribution does not depend on a LinkSwap script.
// https://dev.stay22.com/docs/allez — no dates inferred from event duration.
// Stay22 widget UI language (ISO 639-1). Stay22 has no Traditional-vs-Simplified
// split → both zh and zh-TW map to zh. Unmapped locales fall back to en.
const STAY22_LANG = { en: "en", ko: "ko", ja: "ja", zh: "zh", "zh-TW": "zh", th: "th", vi: "vi", id: "id", ms: "ms", es: "es", fr: "fr", ru: "ru" };
function stay22Lang(locale) { return STAY22_LANG[locale] || "en"; }

export function stay22Hotels(place, locale) {
  if (!STAY22.aid) return null;
  const p = new URLSearchParams({ aid: STAY22.aid, address: place || "South Korea", lang: stay22Lang(locale) });
  return `https://www.stay22.com/allez/roam?${p.toString()}`;
}
export function stay22Embed(place, locale) {
  if (!STAY22.aid) return null;
  const p = new URLSearchParams({ aid: STAY22.aid, address: place || "South Korea", maincolor: "0FA08C", lang: stay22Lang(locale) });
  return `https://www.stay22.com/embed/gm?${p.toString()}`;
}
