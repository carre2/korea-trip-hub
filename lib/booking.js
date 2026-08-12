// Central booking / affiliate config.
// Klook is LIVE (redirect-style links). Agoda/others fill in later.
//
//   Klook   -> https://affiliate.klook.com/redirect?aid=..&aff_adid=..&k_site=<encoded dest>
//   Agoda   -> appends ?cid=<id>   (fill AFF.agoda when you join Agoda Partners)
//   Trip.com-> appends the full param string in AFF.tripcom
//   Trazy   -> appends ?utm_source=<id>

// Klook affiliate credentials (public tracking IDs — safe to ship).
export const KLOOK = { aid: "130139", adid: "1372119" };

// Other partners' affiliate IDs — empty until you join each program.
// Agoda cid 1972168 (Agoda Partner Center, site ktriphub.com). Commissions
// activate once Agoda's manual site review flips the site to Approved.
export const AFF = { agoda: "1972168", tripcom: "", trazy: "" };

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
};
export function agodaCity(key) {
  return AGODA_CITY[key] || "https://www.agoda.com/country/south-korea.html";
}
