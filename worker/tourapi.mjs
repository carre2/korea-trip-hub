// Korea Tourism Organization TourAPI client + place-report assembly.
// Validated 2026-11-08 against live KorService2/EngService2 — see docs/PLACE_REPORT_FEATURE.md.
//
// Design notes (do not regress):
// - Classify by lclsSystm1 (language-independent), NOT contentTypeId (differs per service).
// - Korean keywords are UTF-8 encoded by URLSearchParams automatically.
// - serviceKey is the account's Decoding key, held in env.TOURAPI_KEY (Worker secret).
// - firstimage URLs come as http:// from tong.visitkorea — upgrade to https.

import SIGUNGU_KO from "./sigungu-ko.json" with { type: "json" };

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

// 시도 (province/metro) name -> areaCode, for detecting broad-region ("area") input.
// Codes are stable and shared across language services.
const AREA_CODES = [
  [1,  ["서울", "서울특별시", "seoul"]],
  [2,  ["인천", "인천광역시", "incheon"]],
  [3,  ["대전", "대전광역시", "daejeon"]],
  [4,  ["대구", "대구광역시", "daegu"]],
  [5,  ["광주", "광주광역시", "gwangju"]],
  [6,  ["부산", "부산광역시", "busan"]],
  [7,  ["울산", "울산광역시", "ulsan"]],
  [8,  ["세종", "세종특별자치시", "sejong"]],
  [31, ["경기", "경기도", "gyeonggi", "gyeonggi-do"]],
  [32, ["강원", "강원도", "강원특별자치도", "gangwon", "gangwon-do"]],
  [33, ["충북", "충청북도", "chungbuk", "north chungcheong", "chungcheongbuk-do"]],
  [34, ["충남", "충청남도", "chungnam", "south chungcheong", "chungcheongnam-do"]],
  [35, ["경북", "경상북도", "gyeongbuk", "north gyeongsang", "gyeongsangbuk-do"]],
  [36, ["경남", "경상남도", "gyeongnam", "south gyeongsang", "gyeongsangnam-do"]],
  [37, ["전북", "전라북도", "jeonbuk", "north jeolla", "jeollabuk-do"]],
  [38, ["전남", "전라남도", "jeonnam", "south jeolla", "jeollanam-do"]],
  [39, ["제주", "제주도", "제주특별자치도", "jeju", "jeju-do", "jeju island"]],
];
// legacy sigungu names (areaCode2 still returns these) to hide in drill-down.
const LEGACY_SIGUNGU = new Set(["남제주군", "북제주군"]);

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

// 시군구 (city/county/district) match, e.g. "경주" / "경주시" / "Gyeongju" / "Gyeongju-si".
// Returns { areaCode, sigunguCode, name, areaName } only when exactly one sigungu matches
// (ambiguous names like "중구" or "고성" fall through to keyword search).
function stripSigungu(name) {
  return norm(name).replace(/(-si|-gun|-gu|시|군|구)$/, "");
}
async function matchSigungu(env, lc, q) {
  const qn = norm(q);
  if (!qn || qn.length > 15) return null;
  const qBase = stripSigungu(qn);
  if (qBase.length < 2) return null;
  if (lc === "ko") {
    // Static table (worker/sigungu-ko.json): live lookup costs 18 TourAPI calls per
    // search and exhausted the daily quota on 2026-11-09.
    const hits = SIGUNGU_KO.sigungu.filter(([, , name]) => !LEGACY_SIGUNGU.has(name) &&
      (norm(name) === qn || stripSigungu(name) === qBase));
    if (hits.length !== 1) return null;
    const [areaCode, sigunguCode, name] = hits[0];
    return { areaCode, sigunguCode, name, areaName: SIGUNGU_KO.areas[areaCode] || "" };
  }
  // Latin-script names (Gyeongju-si): live lookup, served from Cloudflare's edge cache.
  if (!/^[a-z][a-z -]*$/.test(qn)) return null;
  const areas = await call(env, lc, "areaCode2", { numOfRows: 40, pageNo: 1 });
  const lists = await Promise.all(areas.map((a) =>
    call(env, lc, "areaCode2", { areaCode: a.code, numOfRows: 60, pageNo: 1 })
      .then((list) => list.map((s) => ({ areaCode: Number(a.code), areaName: a.name, sigunguCode: String(s.code), name: s.name })))
      .catch(() => [])));
  const hits = lists.flat().filter((s) => s.name && !LEGACY_SIGUNGU.has(s.name) &&
    (norm(s.name) === qn || stripSigungu(s.name) === qBase));
  return hits.length === 1 ? hits[0] : null;
}
async function areaName(env, lc, areaCode) {
  try {
    const areas = await call(env, lc, "areaCode2", { numOfRows: 40, pageNo: 1 });
    const a = areas.find((x) => Number(x.code) === Number(areaCode));
    return a ? a.name : "";
  } catch { return ""; }
}

export function matchAreaCode(input) {
  const q = norm(input);
  for (const [code, names] of AREA_CODES) {
    if (names.some((n) => q === n || q === norm(n))) return code;
  }
  return null;
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
  const sgg = await matchSigungu(env, lc, q);
  if (sgg) {
    return { ok: true, mode: "area", areaCode: sgg.areaCode, sigunguCode: sgg.sigunguCode,
      title: q, region: `${sgg.areaName} ${sgg.name}`.trim(), candidates: [], resolvedIn: lc };
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

// Pull the overview/hero for a landmark content id.
async function detail(env, locale, contentId) {
  const d = (await call(env, nativeLocale(locale), "detailCommon2", { contentId }))[0];
  if (!d) return { overview: "", image: "" };
  return { overview: (d.overview || "").trim(), image: toHttps(d.firstimage || "") };
}

// Build the full report JSON. opts: { contentId, areaCode, sigunguCode, radius }
export async function buildReport(env, input, locale, opts = {}) {
  const lc = nativeLocale(locale);
  const r = await resolvePlace(env, input, locale);
  if (!r.ok) return { ok: false, error: r.error };

  let center = null, areaCode = opts.areaCode || r.areaCode || null;
  let title = r.title, landmark = null, drilldown = [], region = "";
  let useLandmarkText = true;
  let raw = [];
  let fetchKo = null; // same query against KorService2, for filling thin sections

  if (r.mode === "area" || areaCode) {
    // broad region: area-based list (+ sigungu drill-down at province level)
    const sigunguCode = opts.sigunguCode || r.sigunguCode || "";
    const params = { areaCode, numOfRows: 100, pageNo: 1, arrange: "O" };
    if (sigunguCode) params.sigunguCode = sigunguCode;
    raw = await call(env, lc, "areaBasedList2", params);
    raw = await topUp(raw, (cls) => call(env, lc, "areaBasedList2", { ...params, lclsSystm1: cls }));
    fetchKo = (cls) => call(env, "ko", "areaBasedList2", cls ? { ...params, lclsSystm1: cls } : params);
    const sgg = await call(env, lc, "areaCode2", { areaCode, numOfRows: 40, pageNo: 1 });
    if (!r.sigunguCode) {
      drilldown = sgg
        .filter((s) => s.name && !LEGACY_SIGUNGU.has(s.name))
        .map((s) => ({ code: s.code, name: s.name }));
    }
    // TourAPI has no popularity order, so any single item here is arbitrary (alphabetical):
    // use one attraction only for the photo + map centre, never as the region's overview.
    const isSight = (x) => BUCKET[x.lclsSystm1] === "sights";
    landmark = raw.find((x) => isSight(x) && x.firstimage) || raw.find((x) => x.firstimage) || raw[0] || null;
    useLandmarkText = false;
    const sggName = sigunguCode ? ((sgg.find((s) => String(s.code) === String(sigunguCode)) || {}).name || "") : "";
    // r.region is in the language the query was resolved in; show the page's language.
    region = (r.resolvedIn === lc && r.region) || `${await areaName(env, lc, areaCode)} ${sggName}`.trim();
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
