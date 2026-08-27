// Central booking / affiliate config.
// Klook is LIVE (redirect-style links). Agoda/others fill in later.
//
//   Klook   -> https://affiliate.klook.com/redirect?aid=..&aff_adid=..&k_site=<encoded dest>
//   Agoda   -> appends ?cid=<id>   (fill AFF.agoda when you join Agoda Partners)
//   Trip.com-> appends the full param string in AFF.tripcom
//   Trazy   -> appends ?utm_source=<id>

// Klook affiliate credentials (public tracking IDs — safe to ship).
export const KLOOK = { aid: "130139", adid: "1372119" };

// Other partners' affiliate IDs — empty until a program is APPROVED.
// Agoda: application was rejected 2026-08-26 (generic "reapply when more
// developed" template — typical for a new, low-traffic site). Until Agoda
// approves us, we do NOT attach their cid: leaving AFF.agoda empty makes
// withAff() a no-op, so Agoda hotel links ship as plain, non-commission
// links (still useful to readers, and honest). Saved cid to re-enable on
// approval: agoda = "1972168" (Agoda Partner Center, site ktriphub.com).
export const AFF = { agoda: "", tripcom: "", trazy: "" };

// Shown near booking links (FTC-style disclosure — keep it visible).
export const DISCLOSURE =
  "Some links here are partner links — if you book through them we may earn a small commission, at no extra cost to you. We only list services we'd point a friend to.";

// Wrap any Klook destination URL in the affiliate redirect (no-op if no aid).
function klookAff(destUrl) {
  if (!KLOOK.aid) return destUrl;
  return `https://affiliate.klook.com/redirect?aid=${KLOOK.aid}&aff_adid=${KLOOK.adid}&k_site=${encodeURIComponent(destUrl)}`;
}

// Klook search results for a query (returns a ready affiliate link).
export function klookSearch(q) {
  return klookAff(`https://www.klook.com/en-US/search/result/?query=${encodeURIComponent(q)}`);
}
// Wrap a specific Klook page (city/activity) as an affiliate link.
export function klookUrl(destUrl) {
  return klookAff(destUrl);
}

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
  gyeongju: "https://www.agoda.com/city/gyeongju-kr.html",
  jeonju: "https://www.agoda.com/city/jeonju-kr.html",
  gangneung: "https://www.agoda.com/city/gangneung-kr.html",
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
export const STAY22 = { aid: "" };
export function stay22Embed(place) {
  if (!STAY22.aid) return null;
  const p = new URLSearchParams({ aid: STAY22.aid, address: place || "South Korea", maincolor: "0FA08C" });
  return `https://www.stay22.com/embed/gm?${p.toString()}`;
}
