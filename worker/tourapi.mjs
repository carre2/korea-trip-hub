// Korea Tourism Organization TourAPI client + place-report assembly.
// Validated 2026-11-08 against live KorService2/EngService2 — see docs/PLACE_REPORT_FEATURE.md.
//
// Design notes (do not regress):
// - Classify by lclsSystm1 (language-independent), NOT contentTypeId (differs per service).
// - Korean keywords are UTF-8 encoded by URLSearchParams automatically.
// - serviceKey is the account's Decoding key, held in env.TOURAPI_KEY (Worker secret).
// - firstimage URLs come as http:// from tong.visitkorea — upgrade to https.

import LDONG from "./ldong.json" with { type: "json" };

const HOST = "https://apis.data.go.kr/B551011";

// locale -> native TourAPI language service. Locales without one fall back to English data.
const SERVICE = {
  ko: "KorService2", en: "EngService2", ja: "JpnService2",
  zh: "ChsService2", "zh-TW": "ChtService2",
  fr: "FreService2", es: "SpnService2", ru: "RusService2",
};
const FALLBACK_LOCALE = "en";
// Language services our data.go.kr key is approved for. Checked 2026-11-09: only
// KorService2 + EngService2 answer; Jpn/Chs/Cht/Fre/Spn/Rus return 403 reason 30
// ("SERVICE_KEY_IS_NOT_REGISTERED"), which broke ja/zh/fr/es/ru reports entirely.
// After approving another service at data.go.kr (활용신청), add its locale here.
const APPROVED = new Set(["ko", "en"]);
export function serviceFor(locale) {
  return SERVICE[nativeLocale(locale)];
}
export function nativeLocale(locale) {
  return SERVICE[locale] && APPROVED.has(locale) ? locale : FALLBACK_LOCALE;
}

// lclsSystm1 large-category -> report section (same across all languages).
// EX (experience/medical tourism) is intentionally excluded from sights.
const BUCKET = {
  FD: "food", AC: "lodging", SH: "shopping",
  VE: "sights", HS: "sights", NA: "sights", EV: "sights",
};

// Regions use legal-dong (법정동) codes — lDongRegnCd (시도) / lDongSignguCd (시군구).
// TourAPI marks the old areaCode2 "미사용" and newer listings carry no areacode at all:
// 경주 sights via areaCode = 23, via lDong = 201 (checked 2026-11-09). Names come from a
// static table (worker/ldong.json, ko+en, fetched 2026-11-09) — zero API calls to match.
// 광주광역시 and 전라남도 are now one region: 12 전남광주통합특별시.
const REGION_ALIASES = {
  11: ["서울", "seoul"], 28: ["인천", "incheon"], 30: ["대전", "daejeon"], 27: ["대구", "daegu"],
  12: ["광주", "전남", "전라남도", "광주광역시", "gwangju", "jeonnam", "south jeolla", "jeollanam-do"],
  26: ["부산", "busan"], 31: ["울산", "ulsan"], 36110: ["세종", "sejong"],
  41: ["경기", "gyeonggi"], 51: ["강원", "강원도", "gangwon"],
  43: ["충북", "chungbuk", "north chungcheong"], 44: ["충남", "chungnam", "south chungcheong"],
  47: ["경북", "gyeongbuk", "north gyeongsang"], 48: ["경남", "gyeongnam", "south gyeongsang"],
  52: ["전북", "전라북도", "jeonbuk", "north jeolla", "jeollabuk-do"],
  50: ["제주", "제주도", "jeju", "jeju island"],
};
export function regionName(code, lc) {
  const r = LDONG.regions.find((x) => String(x.code) === String(code));
  return r ? (lc === "ko" ? r.ko : r.en || r.ko) : "";
}
export function sigunguName(regionCode, sgCode, lc) {
  const r = LDONG.regions.find((x) => String(x.code) === String(regionCode));
  const s = r && r.sigungu.find((x) => String(x.code) === String(sgCode));
  return s ? (lc === "ko" ? s.ko : s.en || s.ko) : "";
}
export function sigunguList(regionCode, lc) {
  const r = LDONG.regions.find((x) => String(x.code) === String(regionCode));
  return r ? r.sigungu.map((s) => ({ code: s.code, name: lc === "ko" ? s.ko : s.en || s.ko })) : [];
}

// 시도 match: full name in either language or a common short form.
export function matchAreaCode(input) {
  const q = norm(input);
  for (const r of LDONG.regions) {
    const names = [r.ko, r.en, ...(REGION_ALIASES[r.code] || [])].map(norm);
    if (names.includes(q)) return r.code;
  }
  return null;
}

// 시군구 match, e.g. "경주" / "경주시" / "Gyeongju" / "Gyeongju-si". Only a unique match counts
// (ambiguous names like "중구" or "고성" fall through to keyword search).
function stripSigungu(name) {
  return norm(name).replace(/(-si|-gun|-gu|시|군|구)$/, "");
}
function matchSigungu(q) {
  const qn = norm(q);
  if (!qn || qn.length > 15) return null;
  const qBase = stripSigungu(qn);
  if (qBase.length < 2) return null;
  const hits = [];
  for (const r of LDONG.regions) {
    for (const s of r.sigungu) {
      if ([s.ko, s.en].some((n) => n && (norm(n) === qn || stripSigungu(n) === qBase))) hits.push({ r, s });
    }
  }
  if (hits.length !== 1) return null;
  return { areaCode: hits[0].r.code, sigunguCode: hits[0].s.code };
}

function norm(s) {
  return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
// Relevance of a candidate title to the (normalized) query: exact > prefix > contains.
function relScore(title, qn) {
  const t = norm(title);
  if (t === qn) return 3;
  if (t.startsWith(qn)) return 2;
  if (t.includes(qn)) return 1;
  return 0;
}
// Candidate ordering: relevance first, then real attractions over shops/food/stays
// (a branch store "가나안경원 명동점" must never outrank "명동"), then having a photo.
const SIGHT_CLASSES = new Set(["VE", "HS", "NA", "EV", "EX"]);
function candScore(c, qn) {
  return relScore(c.title, qn) * 10 + (SIGHT_CLASSES.has(c.cls) ? 2 : 0) + (c.image ? 1 : 0);
}

function toHttps(u) {
  return (u || "").replace("http://tong.visitkorea", "https://tong.visitkorea");
}

async function call(env, locale, op, params) {
  const svc = serviceFor(locale);
  const qs = new URLSearchParams({
    serviceKey: env.TOURAPI_KEY,
    MobileOS: "ETC", MobileApp: "ktriphub", _type: "json",
    ...params,
  });
  const url = `${HOST}/${svc}/${op}?${qs.toString()}`;
  // Cache successes for a day, never errors: a cached 429 (quota) or 403 (key) would
  // keep failing for 24 h after the cause is fixed.
  const res = await fetch(url, { cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": 86400, "300-599": 0 } } });
  if (!res.ok) {
    // data.go.kr gateway errors carry a numeric returnReasonCode (e.g. 30 = key not registered).
    let rc = "";
    try { rc = ((await res.text()).match(/returnReasonCode"?\s*[:>]\s*"?(\d{1,3})/) || [])[1] || ""; } catch { /* ignore */ }
    throw new Error("tourapi_http_" + res.status + (rc ? "_r" + rc : ""));
  }
  let body;
  try { body = (await res.json())?.response?.body; } catch { throw new Error("tourapi_badjson"); }
  const items = body && body.items;
  if (!items || items === "") return [];
  const it = items.item;
  return Array.isArray(it) ? it : (it ? [it] : []);
}

function poi(p) {
  return {
    id: p.contentid,
    title: p.title || "",
    addr: p.addr1 || "",
    lat: parseFloat(p.mapy),
    lng: parseFloat(p.mapx),
    image: toHttps(p.firstimage || p.firstimage2 || ""),
    tel: p.tel || "",
    dist: p.dist ? Math.round(parseFloat(p.dist)) : null,
    cat: BUCKET[p.lclsSystm1] || null,
  };
}

function bucketize(rawItems, limits = { sights: 6, food: 6, shopping: 4, lodging: 5 }) {
  const out = { sights: [], food: [], shopping: [], lodging: [] };
  const seen = new Set();
  for (const raw of rawItems) {
    const b = BUCKET[raw.lclsSystm1];
    if (!b || seen.has(raw.contentid) || !raw.contentid) continue;
    if (out[b].length >= (limits[b] || 6)) continue;
    seen.add(raw.contentid);
    out[b].push(poi(raw));
  }
  return out;
}

// Sections that would show fewer than MIN_PER_SECTION entries.
const MIN_PER_SECTION = 3;
const TOPUP_CLASS = { food: "FD", lodging: "AC", shopping: "SH" };
function thinBuckets(raw) {
  const b = bucketize(raw);
  return ["sights", "food", "lodging"].filter((k) => b[k].length < MIN_PER_SECTION);
}
// For each thin food/lodging/shopping section, fetch that category alone and append.
async function topUp(raw, fetchClass) {
  const b = bucketize(raw);
  const thin = Object.keys(TOPUP_CLASS).filter((k) => b[k].length < MIN_PER_SECTION);
  const extra = await Promise.all(thin.map((k) => fetchClass(TOPUP_CLASS[k]).catch(() => [])));
  return raw.concat(...extra);
}

// Non-Korean services carry far fewer listings (화천 within 20 km: EngService2 has 0
// restaurants, KorService2 has 4). For sections still thin in the visitor's language,
// append Korean-service entries marked lang:"ko". Content ids differ per service, so
// skip a Korean entry that sits within ~80 m of something already listed.
function nearSame(a, b) {
  const dLat = (a.lat - b.lat) * 111000, dLng = (a.lng - b.lng) * 88000;
  return Math.hypot(dLat, dLng) < 80;
}
async function fillFromKorean(sections, fetchKo, limits = { sights: 6, food: 6, shopping: 4, lodging: 5 }) {
  const thin = Object.keys(sections).filter((k) => sections[k].length < MIN_PER_SECTION);
  if (!thin.length) return sections;
  let koRaw = await fetchKo(null).catch(() => []);
  koRaw = await topUp(koRaw, (cls) => fetchKo(cls));
  const ko = bucketize(dedupeSort(koRaw), { sights: 50, food: 50, shopping: 50, lodging: 50 });
  const all = () => Object.values(sections).flat();
  for (const k of thin) {
    for (const item of ko[k]) {
      if (sections[k].length >= (limits[k] || 6)) break;
      if (!Number.isFinite(item.lat) || all().some((x) => nearSame(x, item))) continue;
      sections[k].push({ ...item, lang: "ko" });
    }
  }
  return sections;
}

function dedupeSort(items) {
  return [...items].sort((a, b) => {
    const da = parseFloat(a.dist || "99999") || 99999;
    const db = parseFloat(b.dist || "99999") || 99999;
    return da - db;
  });
}

// Resolve free-text input into a place target (mode + coords/areaCode) with candidates
// for disambiguation. Does NOT build the full report.
export async function resolvePlace(env, input, locale) {
  const q = String(input || "").trim();
  if (!q) return { ok: false, error: "empty" };
  // A Hangul query is resolved against Korean data whatever the page language: in
  // EngService2 "명동" only matches titles like "… (명동닭갈비)" (→ Chuncheon) and
  // "경주" never matches the English sigungu name "Gyeongju-si".
  const lc = /[가-힣]/.test(q) ? "ko" : nativeLocale(locale);

  // 1) broad region?
  const areaCode = matchAreaCode(q);
  if (areaCode) {
    return { ok: true, mode: "area", areaCode, title: q, candidates: [], resolvedIn: lc };
  }

  // 2) city/county/district (시군구)?
  const sgg = matchSigungu(q);
  if (sgg) {
    return { ok: true, mode: "area", areaCode: sgg.areaCode, sigunguCode: sgg.sigunguCode,
      title: q, candidates: [], resolvedIn: lc };
  }

  // 3) keyword search -> candidates (points). TourAPI orders alphabetically, so fetch a
  // full page: with 10 rows "명동" (exact) was cut off behind "가나안경원 명동점".
  const hits = await call(env, lc, "searchKeyword2", { keyword: q, numOfRows: 100, pageNo: 1, arrange: "O" });
  const cands = hits
    .filter((h) => h.mapx && h.mapy)
    .map((h) => ({
      id: h.contentid, title: h.title, addr: h.addr1 || "",
      lat: parseFloat(h.mapy), lng: parseFloat(h.mapx),
      image: toHttps(h.firstimage || ""), cls: h.lclsSystm1 || "",
    }));
  if (!cands.length) return { ok: false, error: "not_found" };
  const qn = norm(q);
  cands.sort((a, b) => candScore(b, qn) - candScore(a, qn));
  const pick = cands[0];
  const rel = relScore(pick.title, qn);
  const title = rel === 3 ? pick.title : q; // keep the user's wording unless it is the same place
  // Only a real attraction (or an exact name match) may supply the headline photo/overview.
  // A branch store that merely contains the query just anchors the map position.
  const landmarkOk = rel === 3 || SIGHT_CLASSES.has(pick.cls);
  return { ok: true, mode: "radius", title, coords: { lat: pick.lat, lng: pick.lng }, pick, landmarkOk, candidates: cands.slice(0, 6), resolvedIn: lc };
}

// lDong query params for a region (+ optional sigungu).
function ldongParams(regionCode, sigunguCode) {
  const p = { lDongRegnCd: String(regionCode) };
  if (sigunguCode) p.lDongSignguCd = String(sigunguCode);
  return p;
}

// A specific content id (picked from a browse list) as a point target.
async function resolveContent(env, contentId, cl, fallbackTitle) {
  const svcLc = cl === "ko" ? "ko" : nativeLocale(cl);
  const d = (await call(env, svcLc, "detailCommon2", { contentId }))[0];
  if (!d || !d.mapx || !d.mapy) return { ok: false, error: "not_found" };
  const pick = {
    id: String(d.contentid || contentId), title: d.title || fallbackTitle || "", addr: d.addr1 || "",
    lat: parseFloat(d.mapy), lng: parseFloat(d.mapx), image: toHttps(d.firstimage || ""), cls: d.lclsSystm1 || "",
  };
  return { ok: true, mode: "radius", title: pick.title, coords: { lat: pick.lat, lng: pick.lng }, pick,
    landmarkOk: true, candidates: [pick], resolvedIn: svcLc };
}

// Pull the overview/hero for a landmark content id.
async function detail(env, locale, contentId) {
  const d = (await call(env, nativeLocale(locale), "detailCommon2", { contentId }))[0];
  if (!d) return { overview: "", image: "" };
  return { overview: (d.overview || "").trim(), image: toHttps(d.firstimage || "") };
}

// Build the full report JSON. opts: { contentId, areaCode, sigunguCode, radius }
export async function buildReport(env, input, locale, opts = {}) {
  const lc = nativeLocale(locale);
  // A contentId from the browse list (opts.cl = the service it came from) is the place
  // itself: no keyword guessing.
  const r = opts.contentId && opts.cl ? await resolveContent(env, opts.contentId, opts.cl, input)
    : await resolvePlace(env, input, locale);
  if (!r.ok) return { ok: false, error: r.error };

  let center = null, areaCode = opts.areaCode || r.areaCode || null;
  let title = r.title, landmark = null, drilldown = [], region = "";
  let useLandmarkText = true;
  let raw = [];
  let fetchKo = null; // same query against KorService2, for filling thin sections

  if (r.mode === "area" || areaCode) {
    // broad region: area-based list (+ sigungu drill-down at province level)
    const sigunguCode = opts.sigunguCode || r.sigunguCode || "";
    const params = { ...ldongParams(areaCode, sigunguCode), numOfRows: 100, pageNo: 1, arrange: "O" };
    raw = await call(env, lc, "areaBasedList2", params);
    raw = await topUp(raw, (cls) => call(env, lc, "areaBasedList2", { ...params, lclsSystm1: cls }));
    fetchKo = (cls) => call(env, "ko", "areaBasedList2", cls ? { ...params, lclsSystm1: cls } : params);
    if (!r.sigunguCode) drilldown = sigunguList(areaCode, lc);
    // TourAPI has no popularity order, so any single item here is arbitrary (alphabetical):
    // use one attraction only for the photo + map centre, never as the region's overview.
    const isSight = (x) => BUCKET[x.lclsSystm1] === "sights";
    landmark = raw.find((x) => isSight(x) && x.firstimage) || raw.find((x) => x.firstimage) || raw[0] || null;
    useLandmarkText = false;
    region = `${regionName(areaCode, lc)} ${sigunguCode ? sigunguName(areaCode, sigunguCode, lc) : ""}`.trim();
    center = landmark ? { lat: parseFloat(landmark.mapy), lng: parseFloat(landmark.mapx) } : null;
  } else {
    // point: pick (user-chosen contentId or best) -> radius search
    let pick = r.pick;
    useLandmarkText = r.landmarkOk !== false;
    if (opts.contentId) {
      const byId = r.candidates.find((c) => c.id === opts.contentId);
      if (byId) { pick = byId; title = byId.title; useLandmarkText = true; } // explicit user pick overrides the title guess
    }
    center = { lat: pick.lat, lng: pick.lng };
    landmark = pick;
    // Street address of a store isn't the place's location: show only 시도 + 시군구 then.
    region = useLandmarkText ? (pick.addr || "") : (pick.addr || "").split(" ").slice(0, 2).join(" ");
    // Nearest-first (arrange E — the default order is alphabetical, which dropped close
    // places once a wide radius had >100 hits). Dense centres fill up within 1.3 km; rural
    // spots (예산시장, 화천 산천어축제) need 5 km, then 20 km (TourAPI max). Widen until every
    // main section has a few entries, not just until the total looks big enough.
    const radii = opts.radius ? [opts.radius] : [1300, 5000, 20000];
    const geo = { mapX: center.lng, mapY: center.lat, numOfRows: 100, pageNo: 1, arrange: "E" };
    for (const radius of radii) {
      raw = await call(env, lc, "locationBasedList2", { ...geo, radius });
      if (!thinBuckets(raw).length) break;
    }
    // Still thin (e.g. many shops crowd out restaurants in the 100 nearest): ask for that
    // category alone, nearest-first, at the widest radius.
    raw = await topUp(raw, (cls) => call(env, lc, "locationBasedList2", { ...geo, radius: radii[radii.length - 1], lclsSystm1: cls }));
    raw = dedupeSort(raw);
    const koGeo = { ...geo, radius: radii[radii.length - 1] };
    fetchKo = (cls) => call(env, "ko", "locationBasedList2", cls ? { ...koGeo, lclsSystm1: cls } : koGeo);
  }

  let sections = bucketize(raw);
  if (lc !== "ko" && fetchKo) sections = await fillFromKorean(sections, fetchKo);

  // overview + hero
  let overview = "", hero = "";
  if (landmark && (useLandmarkText || r.mode === "area")) {
    hero = (landmark.image || landmark.firstimage) ? toHttps(landmark.image || landmark.firstimage) : "";
  }
  const landmarkId = landmark && (landmark.id || landmark.contentid);
  if (landmarkId && useLandmarkText) {
    // Content ids are per language service: read the landmark from the one it came from.
    const d = await detail(env, r.resolvedIn || locale, landmarkId);
    overview = d.overview;
    if (!hero) hero = d.image;
  }
  if (!hero) {
    for (const b of ["sights", "food", "shopping", "lodging"]) {
      const withImg = sections[b].find((x) => x.image);
      if (withImg) { hero = withImg.image; break; }
    }
  }

  return {
    ok: true,
    place: {
      title,
      region,
      coords: center,
      hero,
      overview,
      mode: areaCode ? "area" : "radius",
      areaCode: areaCode || null,
    },
    drilldown,
    sections,
    counts: {
      sights: sections.sights.length, food: sections.food.length,
      shopping: sections.shopping.length, lodging: sections.lodging.length,
    },
    source: { provider: "Korea Tourism Organization TourAPI", service: serviceFor(lc), collectedAt: new Date().toISOString().slice(0, 10) },
    localeData: lc, // which language's data was actually used (for fallback transparency)
  };
}

// ---------------------------------------------------------------------------
// Browse (단계별 찾기): region -> sigungu -> category list, one page at a time.
// Categories: sights | festival | food | stay | shopping | course.
const SIGHTS_TYPE = { ko: 12, en: 76 }; // contentTypeId of 관광지 in each service
const CAT_CLASS = { food: "FD", stay: "AC", shopping: "SH", course: "C01" };
export const BROWSE_CATS = ["sights", "festival", "food", "stay", "shopping", "course"];
const BROWSE_ROWS = 12;

function ymd(d) {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}
// Festival window in KST. upcoming = on now or later; month = through this month; next = next month.
export function festivalWindow(when, now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  const y = kst.getUTCFullYear(), m = kst.getUTCMonth();
  if (when === "next") {
    return { eventStartDate: ymd(new Date(Date.UTC(y, m + 1, 1))), eventEndDate: ymd(new Date(Date.UTC(y, m + 2, 0))) };
  }
  if (when === "month") return { eventStartDate: ymd(kst), eventEndDate: ymd(new Date(Date.UTC(y, m + 1, 0))) };
  return { eventStartDate: ymd(kst) };
}

function browseItem(x, cl) {
  const it = {
    id: String(x.contentid), title: x.title || "", addr: x.addr1 || "",
    lat: parseFloat(x.mapy), lng: parseFloat(x.mapx), image: toHttps(x.firstimage || x.firstimage2 || ""), cl,
  };
  if (x.eventstartdate) { it.start = x.eventstartdate; it.end = x.eventenddate || ""; }
  return it;
}

async function browseCall(env, lc, cat, base, when) {
  if (cat === "festival") {
    return call(env, lc, "searchFestival2", { ...base, ...festivalWindow(when), arrange: "A" });
  }
  const p = { ...base, arrange: "Q" }; // Q = recently updated, with a photo
  if (cat === "sights") p.contentTypeId = SIGHTS_TYPE[lc] || SIGHTS_TYPE.en;
  else p.lclsSystm1 = CAT_CLASS[cat];
  return call(env, lc, "areaBasedList2", p);
}

export async function browse(env, locale, { region, sigungu = "", cat, when = "upcoming", page = 1 }) {
  if (!LDONG.regions.some((r) => String(r.code) === String(region))) return { ok: false, error: "bad_region" };
  if (!BROWSE_CATS.includes(cat)) return { ok: false, error: "bad_category" };
  const lc = nativeLocale(locale);
  const base = { ...ldongParams(region, sigungu), numOfRows: BROWSE_ROWS, pageNo: Math.max(1, Number(page) || 1) };
  // Courses only exist in the Korean service.
  const primaryLc = cat === "course" ? "ko" : lc;
  let items = (await browseCall(env, primaryLc, cat, base, when)).filter((x) => x.contentid).map((x) => browseItem(x, primaryLc));
  if (primaryLc !== "ko" && items.length < MIN_PER_SECTION && base.pageNo === 1) {
    const ko = (await browseCall(env, "ko", cat, base, when).catch(() => [])).map((x) => browseItem(x, "ko"));
    for (const k of ko) {
      if (items.length >= BROWSE_ROWS) break;
      if (!items.some((x) => Number.isFinite(k.lat) && nearSame(x, k))) items.push({ ...k, lang: "ko" });
    }
  }
  if (cat === "festival") items.sort((a, b) => (a.start || "").localeCompare(b.start || ""));
  if (primaryLc === "ko" && lc !== "ko") items = items.map((x) => ({ ...x, lang: "ko" }));
  return {
    ok: true, items, page: base.pageNo, more: items.length >= BROWSE_ROWS,
    region: regionName(region, lc), sigungu: sigungu ? sigunguName(region, sigungu, lc) : "",
    source: { provider: "Korea Tourism Organization TourAPI", collectedAt: new Date().toISOString().slice(0, 10) },
  };
}

// ---------------------------------------------------------------------------
// Map explore: where each 시군구 of a region sits, from real listings.
// One areaBasedList2 call (Korean service, attractions, up to 1,000 rows) carries
// lDongSignguCd + coordinates for every item; the median position per 시군구 places
// its map bubble. Positions are language-independent; names come from ldong.json.
function median(a) {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
}
export async function regionMap(env, region) {
  const reg = LDONG.regions.find((r) => String(r.code) === String(region));
  if (!reg) return { ok: false, error: "bad_region" };
  const rows = await call(env, "ko", "areaBasedList2", {
    lDongRegnCd: String(region), contentTypeId: SIGHTS_TYPE.ko, numOfRows: 1000, pageNo: 1, arrange: "A",
  });
  const by = new Map();
  for (const x of rows) {
    const lat = parseFloat(x.mapy), lng = parseFloat(x.mapx), sg = String(x.lDongSignguCd || "");
    if (!sg || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    if (!by.has(sg)) by.set(sg, { lat: [], lng: [] });
    by.get(sg).lat.push(lat); by.get(sg).lng.push(lng);
  }
  const sigungu = reg.sigungu
    .filter((s) => by.has(String(s.code)))
    .map((s) => {
      const p = by.get(String(s.code));
      return { code: s.code, ko: s.ko, en: s.en, lat: median(p.lat), lng: median(p.lng), n: p.lat.length };
    });
  return { ok: true, region: { code: reg.code, ko: reg.ko, en: reg.en }, sigungu };
}
