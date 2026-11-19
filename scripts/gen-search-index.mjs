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

fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const loc of LOCALES) {
  const rows = [];
  const add = (p, t, kwParts) => {
    if (!t) return;
    // Alias first so cross-language brand/place terms always survive the length cap.
    const k = ((ALIAS[p] || "") + " " + kwParts.filter(Boolean).join(" ")).toLowerCase().replace(/\s+/g, " ").trim().slice(0, 500);
    rows.push({ p: `/${loc}/${p}/`, t: String(t), k });
  };
  // Topic guides
  for (const slug of topics.order) {
    const g = topicsL[loc][slug]; if (!g) continue;
    const secs = (g.sections || []).map((s) => s.h2).join(" ");
    add(`guides/${slug}`, g.h1, [g.h1, g.kicker, g.metaDesc, secs, snippet(g.answer)]);
  }
  // Destinations
  for (const slug of Object.keys(dest.items)) {
    const d = destL[loc][slug]; if (!d) continue;
    add(`destinations/${slug}`, d.name, [d.name, d.cat, d.blurb, snippet(d.intro, 100)]);
  }
  // Itineraries
  for (const slug of Object.keys(itin.items)) {
    const it = itinL[loc][slug]; if (!it) continue;
    add(`itinerary/${slug}`, it.title, [it.title, it.sub]);
  }
  // Stay cities
  for (const slug of Object.keys(stay.cities)) {
    const c = stayL[loc][slug]; if (!c) continue;
    add(`stay/${slug}`, c.name, [c.name, snippet(c.intro, 100)]);
  }
  // Section hubs with their own localized titles
  const kpopUi = (() => { const p = path.join(DATA, `kpop.${loc}.json`); const f = fs.existsSync(p) ? read(p) : read(path.join(DATA, "kpop.json")); return f.ui || {}; })();
  if (kpopUi.h1) add("kpop", kpopUi.h1, [kpopUi.h1, kpopUi.tagline]);
  const fu = festUi[loc] || festUi.en;
  if (fu?.title) add("festivals", fu.title, [fu.title, fu.intro]);

  fs.writeFileSync(path.join(OUT, `${loc}.json`), JSON.stringify(rows));
  total += rows.length;
}
console.log(`  search index: ${total} rows across ${LOCALES.length} locales → public/search/`);
