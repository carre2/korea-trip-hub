// Central booking / affiliate config.
// SKELETON: affiliate IDs are empty for now — links work as plain links.
// When you join each program, put the tracking IDs in AFF below and every
// booking link across the site becomes an affiliate link automatically.
//
//   Klook Affiliate  -> appends ?aid=<id>
//   Agoda Partners   -> appends ?cid=<id>
//   Trip.com         -> appends ?Allianceid/SID (put full param in AFF.tripcom)
//   Trazy            -> appends ?utm_source=<id>
export const AFF = {
  klook: "",   // e.g. "123456"
  agoda: "",   // e.g. "1900000"
  tripcom: "", // e.g. "Allianceid=xxx&SID=yyy"
  trazy: "",
};

// Shown near booking links (FTC-style disclosure — keep it visible).
export const DISCLOSURE =
  "Some links here are partner links — if you book through them we may earn a small commission, at no extra cost to you. We only list services we'd point a friend to.";

// Append the affiliate parameter for a partner (no-op until an ID is set).
export function withAff(url, partner) {
  const id = AFF[partner];
  if (!id) return url;
  const sep = url.includes("?") ? "&" : "?";
  if (partner === "klook") return `${url}${sep}aid=${id}`;
  if (partner === "agoda") return `${url}${sep}cid=${id}`;
  if (partner === "tripcom") return `${url}${sep}${id}`; // id holds the full param string
  return `${url}${sep}utm_source=${id}`;
}

// Reliable partner search/landing URLs (stable; swap for affiliate deep links later).
export function klookSearch(q) {
  return `https://www.klook.com/en-US/search/result/?query=${encodeURIComponent(q)}`;
}
const AGODA_CITY = {
  seoul: "https://www.agoda.com/city/seoul-kr.html",
  busan: "https://www.agoda.com/city/busan-kr.html",
  jeju: "https://www.agoda.com/city/jeju-island-kr.html",
  gyeongju: "https://www.agoda.com/city/gyeongju-kr.html",
};
export function agodaCity(key) {
  return AGODA_CITY[key] || "https://www.agoda.com/country/south-korea.html";
}
