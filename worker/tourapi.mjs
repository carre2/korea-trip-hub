// Korea Tourism Organization TourAPI client + place-report assembly.
// Validated 2026-11-08 against live KorService2/EngService2 — see docs/PLACE_REPORT_FEATURE.md.
//
// Design notes (do not regress):
// - Classify by lclsSystm1 (language-independent), NOT contentTypeId (differs per service).
// - Korean keywords are UTF-8 encoded by URLSearchParams automatically.
// - serviceKey is the account's Decoding key, held in env.TOURAPI_KEY (Worker secret).
// - firstimage URLs come as http:// from tong.visitkorea — upgrade to https.

const HOST = "https://apis.data.go.kr/B551011";

// locale -> native TourAPI language service. Locales without one fall back to English data.
const SERVICE = {
  ko: "KorService2", en: "EngService2", ja: "JpnService2",
  zh: "ChsService2", "zh-TW": "ChtService2",
  fr: "FreService2", es: "SpnService2", ru: "RusService2",
};
const FALLBACK_LOCALE = "en";
export function serviceFor(locale) {
  return SERVICE[locale] || SERVICE[FALLBACK_LOCALE];
}
export function nativeLocale(locale) {
  return SERVICE[locale] ? locale : FALLBACK_LOCALE;
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
  const res = await fetch(url, { cf: { cacheTtl: 86400, cacheEverything: true } });
  if (!res.ok) throw new Error("tourapi_http_" + res.status);
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
  const lc = nativeLocale(locale);

  // 1) broad region?
  const areaCode = matchAreaCode(q);
  if (areaCode) {
    return { ok: true, mode: "area", areaCode, title: q, candidates: [] };
  }

  // 2) keyword search -> candidates (points)
  const hits = await call(env, lc, "searchKeyword2", { keyword: q, numOfRows: 10, pageNo: 1, arrange: "O" });
  const cands = hits
    .filter((h) => h.mapx && h.mapy)
    .map((h) => ({
      id: h.contentid, title: h.title, addr: h.addr1 || "",
      lat: parseFloat(h.mapy), lng: parseFloat(h.mapx),
      image: toHttps(h.firstimage || ""),
    }));
  if (!cands.length) return { ok: false, error: "not_found" };
  // Rank by relevance to the query (not TourAPI's alphabetical arrange), tie-break on having a photo.
  const qn = norm(q);
  cands.sort((a, b) => (relScore(b.title, qn) - relScore(a.title, qn)) || ((b.image ? 1 : 0) - (a.image ? 1 : 0)));
  const pick = cands[0];
  const title = relScore(pick.title, qn) >= 2 ? pick.title : q; // prefer the user's wording unless an exact/prefix match
  return { ok: true, mode: "radius", title, coords: { lat: pick.lat, lng: pick.lng }, pick, candidates: cands.slice(0, 6) };
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
  let title = r.title, landmark = null, drilldown = [];
  let raw = [];

  if (r.mode === "area" || areaCode) {
    // broad region: area-based list + sigungu drill-down
    const params = { areaCode, numOfRows: 100, pageNo: 1, arrange: "O" };
    if (opts.sigunguCode) params.sigunguCode = opts.sigunguCode;
    raw = await call(env, lc, "areaBasedList2", params);
    const sgg = await call(env, lc, "areaCode2", { areaCode, numOfRows: 40, pageNo: 1 });
    drilldown = sgg
      .filter((s) => s.name && !LEGACY_SIGUNGU.has(s.name))
      .map((s) => ({ code: s.code, name: s.name }));
    const withImg = raw.find((x) => x.firstimage);
    landmark = withImg || raw[0] || null;
    const anchor = landmark ? { lat: parseFloat(landmark.mapy), lng: parseFloat(landmark.mapx) } : null;
    center = anchor;
  } else {
    // point: pick (user-chosen contentId or best) -> radius search
    let pick = r.pick;
    if (opts.contentId) {
      const byId = r.candidates.find((c) => c.id === opts.contentId);
      if (byId) { pick = byId; title = byId.title; } // explicit user pick overrides the title guess
    }
    center = { lat: pick.lat, lng: pick.lng };
    landmark = pick;
    const radius = opts.radius || 1300;
    raw = await call(env, lc, "locationBasedList2", {
      mapX: center.lng, mapY: center.lat, radius, numOfRows: 100, pageNo: 1,
    });
    raw = dedupeSort(raw);
  }

  const sections = bucketize(raw);

  // overview + hero
  let overview = "", hero = (landmark && (landmark.image || landmark.firstimage)) ? toHttps(landmark.image || landmark.firstimage) : "";
  const landmarkId = landmark && (landmark.id || landmark.contentid);
  if (landmarkId) {
    const d = await detail(env, locale, landmarkId);
    overview = d.overview;
    if (!hero) hero = d.image;
  }
  if (!hero) {
    for (const b of ["sights", "food", "shopping", "lodging"]) {
      const withImg = sections[b].find((x) => x.image);
      if (withImg) { hero = withImg.image; break; }
    }
  }

  const region = (landmark && (landmark.addr || landmark.addr1)) || "";

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
