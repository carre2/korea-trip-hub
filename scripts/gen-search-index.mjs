#!/usr/bin/env node
/**
 * gen-search-index.mjs — builds a small client-side search index per locale.
 * Output: public/search/<locale>.json = [{ p: "/<loc>/<path>/", t: title, k: "keywords" }]
 * Consumed by components/SearchBox.jsx (fetched on first use; not bundled).
 *
 * Indexed: topic guides, destinations, itineraries, stay cities, and the K-pop
 * and festivals hubs. Keywords = localized title + short content snippet + a
 * curated cross-language alias list, so "Olive Young" / "올리브영" / "韓妝" all
 * find the same page regardless of the UI language.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const OUT = path.join(ROOT, "public", "search");
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const LOCALES = (() => {
  const m = fs.readFileSync(path.join(ROOT, "lib", "i18n.js"), "utf8").match(/export\s+const\s+locales\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([\w-]+)["'`]/g)].map((x) => x[1]) : [];
})();

// Load a "base + per-locale override" data file and return the merged map for `loc`.
function merged(name, container) {
  const base = read(path.join(DATA, `${name}.json`))[container] || {};
  const out = {};
  for (const loc of LOCALES) {
    const ovPath = path.join(DATA, `${name}.${loc}.json`);
    const ov = loc !== "en" && fs.existsSync(ovPath) ? (read(ovPath)[container] || {}) : {};
    out[loc] = {};
    for (const key of Object.keys(base)) out[loc][key] = { ...base[key], ...(ov[key] || {}) };
  }
  return out;
}

// Curated cross-language aliases appended to a page's keywords in EVERY locale.
const ALIAS = {
  "guides/k-beauty-shopping": "Olive Young 올리브영 オリーブヤング 韩妆 韓妝 K-beauty skincare 스킨케어 화장품 cosmetics makeup tax refund 세금환급 免税 退税 退稅 Myeongdong 명동 명동",
  "guides/idol-makeup": "idol makeup hair 아이돌 메이크업 헤어 偶像 妝髮 妆发 K-pop makeover photoshoot 화보 photo studio",
  "guides/plastic-surgery-safety": "plastic surgery 성형 성형외과 整形 整容 clinic 병원 클리닉 dermatology 피부과 醫美 医美 medical beauty K-MEDI safety",
  "guides/k-beauty": "K-beauty 케이뷰티",
  kpop: "K-pop 케이팝 BTS concert 콘서트 음악방송 打歌 아이돌 idol HYBE SM JYP YG fan 팬",
  festivals: "festival 축제 慶典 祭り lantern fireworks 불꽃 seasonal event",
  "destinations/myeongdong": "Myeongdong 명동 明洞 shopping cosmetics",
  "destinations/hongdae": "Hongdae 홍대 弘大 youth nightlife",
  "destinations/gangnam": "Gangnam 강남 江南 clinic plastic surgery",
  "destinations/seongsu": "Seongsu 성수 聖水 cafe trendy",
};

function snippet(s, n = 140) {
  return (typeof s === "string" ? s : "").replace(/\s+/g, " ").trim().slice(0, n);
}

const topics = read(path.join(DATA, "topics.json"));
const dest = read(path.join(DATA, "destinations.json"));
const itin = read(path.join(DATA, "itineraries.json"));
const stay = read(path.join(DATA, "stay.json"));
const festUi = read(path.join(DATA, "festivals-ui.json"));
const topicsL = merged("topics", "items");
const destL = merged("destinations", "items");
const itinL = merged("itineraries", "items");
const stayL = merged("stay", "cities");
// Per-nationality visa guides (data/visa/<code>.json + .i18n.json). Region codes
// mirror lib/visa.js so Intl.DisplayNames can localize each country name.
const VISA_CODES = fs.readdirSync(path.join(DATA, "visa")).filter((f) => f.endsWith(".json") && !f.endsWith(".i18n.json")).map((f) => f.replace(".json", ""));
const VISA_REGION = { india: "IN", vietnam: "VN", china: "CN", philippines: "PH", indonesia: "ID", usa: "US", japan: "JP", uk: "GB", canada: "CA", australia: "AU", taiwan: "TW", hongkong: "HK", singapore: "SG", malaysia: "MY", thailand: "TH", mongolia: "MN", bangladesh: "BD", nepal: "NP", uzbekistan: "UZ", srilanka: "LK", pakistan: "PK", kazakhstan: "KZ" };

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const loc of LOCALES) {
  const rows = [];
  const add = (p, t, cat, kwParts) => {
    if (!t) return;
    // Alias first so cross-language brand/place terms always survive the length cap.
    const k = ((ALIAS[p] || "") + " " + kwParts.filter(Boolean).join(" ")).toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
    rows.push({ p: `/${loc}/${p}/`, t: String(t), c: cat, k });
  };
  // Topic guides
  for (const slug of topics.order) {
    const g = topicsL[loc][slug]; if (!g) continue;
    const secs = (g.sections || []).map((s) => s.h2).join(" ");
    add(`guides/${slug}`, g.h1, "guide", [g.h1, g.kicker, g.metaDesc, secs, snippet(g.answer)]);
  }
  // Destinations
  for (const slug of Object.keys(dest.items)) {
    const d = destL[loc][slug]; if (!d) continue;
    add(`destinations/${slug}`, d.name, "place", [d.name, d.cat, d.blurb, snippet(d.intro, 100)]);
  }
  // Itineraries
  for (const slug of Object.keys(itin.items)) {
    const it = itinL[loc][slug]; if (!it) continue;
    add(`itinerary/${slug}`, it.title, "itinerary", [it.title, it.sub]);
  }
  // Stay cities
  for (const slug of Object.keys(stay.cities)) {
    const c = stayL[loc][slug]; if (!c) continue;
    add(`stay/${slug}`, c.name, "stay", [c.name, snippet(c.intro, 100)]);
  }
  // Section hubs with their own localized titles
  const kpopUi = (() => { const p = path.join(DATA, `kpop.${loc}.json`); const f = fs.existsSync(p) ? read(p) : read(path.join(DATA, "kpop.json")); return f.ui || {}; })();
  if (kpopUi.h1) add("kpop", kpopUi.h1, "kpop", [kpopUi.h1, kpopUi.tagline]);
  const fu = festUi[loc] || festUi.en;
  if (fu?.title) add("festivals", fu.title, "festival", [fu.title, fu.intro]);
  // Food hub (localized title from messages)
  const msg = (() => { try { return read(path.join(ROOT, "messages", `${loc}.json`)); } catch { return read(path.join(ROOT, "messages", "en.json")); } })();
  if (msg.food?.title) add("food", msg.food.title, "food", [msg.food.title, msg.food.sub, "food restaurant eat dining cooking class 맛집 음식 グルメ 美食"]);
  // Plan guides — the rich /plan/<slug>/ pages (visa, transit, airport, sim, money, weather, help).
  // Their tile title+sub already carry the words people search (t-money, exchange, eSIM, Incheon…);
  // PLAN_KW adds common aliases so "subway", "hotel-less" intents resolve to the right guide.
  const planData = read(path.join(DATA, "plan.json"));
  const planOv = (() => { const p = path.join(DATA, `plan.${loc}.json`); return fs.existsSync(p) ? (read(p).items || {}) : {}; })();
  const PLAN_KW = {
    visa: "visa entry k-eta keta eta permit arrival immigration 비자 입국 签证 簽證 ビザ",
    transit: "transit transport subway metro bus taxi t-money tmoney ktx srt rail getting around navigation 교통 지하철 버스 택시 기차 地下鉄 地铁 交通",
    airport: "airport incheon icn gimpo gmp arrival arex airport bus limousine transfer to city 공항 인천공항 리무진 空港 机场 仁川",
    sim: "sim esim e-sim data sim card wifi wi-fi internet pocket wifi egg roaming 유심 이심 데이터 와이파이 데이터로밍",
    money: "money cash won exchange currency atm card payment tipping budget 환전 현금 원화 카드 결제 兑换 両替 換金",
    weather: "weather climate season when to visit best time pack temperature rain 날씨 계절 기온 날씨예보 天気 天气",
    help: "help emergency police ambulance hospital 119 112 safety lost pharmacy 긴급 응급 병원 경찰 도움 緊急",
  };
  for (const slug of planData.order) {
    const tile = msg.plan?.tiles?.[slug] || {};
    const tag = (planOv[slug]?.tagline) || planData.items[slug]?.tagline || "";
    const title = tile.title || slug;
    add(`plan/${slug}`, title, slug === "visa" ? "visa" : "plan", [title, tile.sub, tag, PLAN_KW[slug] || ""]);
  }
  // Where-to-stay hub (/stay/) — so "hotel", "accommodation", "where to stay" land here.
  const stayUi = (() => { const p = path.join(DATA, `stay.${loc}.json`); const f = fs.existsSync(p) ? read(p) : read(path.join(DATA, "stay.json")); return f.ui || {}; })();
  if (stayUi.hubH1) add("stay", stayUi.hubH1, "stay", [stayUi.hubH1, stayUi.hubTagline, "hotel hotels accommodation where to stay lodging guesthouse hostel airbnb motel hanok booking rooms 숙소 호텔 민박 게스트하우스 ホテル 宿 酒店 住宿"]);
  // Flights info page (/plan/flights/) — so "flight", "airfare", "ticket" land here.
  const flightsUiData = read(path.join(DATA, "flights-ui.json"));
  const flightsT = flightsUiData[loc] || flightsUiData.en;
  if (flightsT?.title) add("plan/flights", flightsT.title, "plan", [flightsT.title, flightsT.metaDesc, "flight flights airfare plane ticket airline book compare skyscanner google flights incheon gimpo icn gmp 항공권 비행기 항공료 비행기표 航空券 机票 機票 vé máy bay เที่ยวบิน"]);
  // Per-nationality visa guides
  let regionNames, enRegion;
  try { regionNames = new Intl.DisplayNames([loc], { type: "region" }); } catch { regionNames = null; }
  try { enRegion = new Intl.DisplayNames(["en"], { type: "region" }); } catch { enRegion = null; }
  for (const code of VISA_CODES) {
    const base = read(path.join(DATA, "visa", `${code}.json`));
    const i18nPath = path.join(DATA, "visa", `${code}.i18n.json`);
    const ov = fs.existsSync(i18nPath) ? (read(i18nPath)[loc] || {}) : {};
    const g = { ...base, ...ov };
    const title = g.h1 || (g.metaTitle || "").replace(/\s*—\s*Korea Trip Hub\s*$/, "") || code;
    const region = VISA_REGION[code];
    const cname = region && regionNames ? (() => { try { return regionNames.of(region); } catch { return ""; } })() : "";
    const cnameEn = region && enRegion ? (() => { try { return enRegion.of(region); } catch { return ""; } })() : "";
    add(`visa/${code}`, title, "visa", [title, cname, cnameEn, code, "visa k-eta entry", g.metaDesc]);
  }

  fs.writeFileSync(path.join(OUT, `${loc}.json`), JSON.stringify(rows));
  total += rows.length;
}
console.log(`  search index: ${total} rows across ${LOCALES.length} locales → public/search/`);
