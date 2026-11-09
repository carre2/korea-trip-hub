// Manual check for the Place Report data layer (worker/tourapi.mjs).
// NOT part of prebuild — it calls the live TourAPI and needs TOURAPI_KEY.
//   node scripts/test-tourapi.mjs
// Key is read from env TOURAPI_KEY, else from .dev.vars.
import { buildReport, browse, matchAreaCode, festivalWindow } from "../worker/tourapi.mjs";
import fs from "node:fs";

function readKey() {
  if (process.env.TOURAPI_KEY) return process.env.TOURAPI_KEY.trim();
  try {
    const dv = fs.readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
    const m = dv.match(/^\s*TOURAPI_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch { /* no .dev.vars */ }
  return "";
}

const KEY = readKey();
if (!KEY) { console.log("SKIP: no TOURAPI_KEY (set env var or .dev.vars)"); process.exit(0); }
const env = { TOURAPI_KEY: KEY };

// [query, locale, opts, extra check]
const CASES = [
  // 2026-11-09 regression: headline came from "가나안경원 명동점" (store) — must be 명동 itself.
  ["명동", "ko", {}, (r) => r.place.title === "명동" && !/안경/.test(r.place.overview + r.place.region)],
  ["Myeongdong", "en", {}],
  ["제주도", "ko", {}, (r) => r.place.mode === "area" && r.drilldown.length > 0], // area + sigungu drill-down
  // 2026-11-09 regression: "경주" became "경주 감은사지" — a 시군구 name is a region report.
  ["경주", "ko", {}, (r) => r.place.title === "경주" && r.place.mode === "area" && /경주시/.test(r.place.region)],
  ["Gyeongju", "en", {}, (r) => r.place.mode === "area"],
  ["예산시장", "ko", {}],           // rural: radius widens automatically
  // 2026-11-09: EngService2 has no restaurants near 화천 — thin sections fill from Korean data.
  ["산천어축제", "en", {}, (r) => r.counts.food >= 3 && r.sections.food.some((x) => x.lang === "ko")],
  // 2026-11-09: key is approved for Kor/Eng only; ja/zh/fr/... must fall back, not 403.
  ["Myeongdong", "ja", {}, (r) => r.localeData === "en"],
  // 2026-11-09: Chs/Cht/Fre/Spn approved — native-script search, native region names, clean text.
  ["明洞", "zh", {}, (r) => r.localeData === "zh" && r.place.title === "明洞" && r.place.overview.length > 0],
  ["济州", "zh", {}, (r) => r.place.mode === "area" && /济州/.test(r.place.region)],
  ["Myeongdong", "fr", {}, (r) => r.localeData === "fr" && !/&[a-z]+;/.test(r.place.overview)],
];

let fail = 0;
for (const [q, locale, opts, extra] of CASES) {
  try {
    const r = await buildReport(env, q, locale, opts);
    const total = r.ok ? r.counts.sights + r.counts.food + r.counts.lodging : 0;
    const ok = r.ok && total > 0 && r.place.title && (!extra || extra(r));
    console.log(
      ok ? "PASS" : "FAIL",
      `${q} / ${locale}`,
      "->",
      r.ok ? `"${r.place.title}" [${r.place.mode}] ${JSON.stringify(r.counts)} hero=${!!r.place.hero} drill=${r.drilldown.length}` : r.error
    );
    if (!ok) fail++;
  } catch (e) {
    console.log("ERROR", `${q} / ${locale}`, e.message);
    fail++;
  }
}
// Offline checks (no API calls): legal-dong region matching from worker/ldong.json.
const off = [
  ["광주 -> merged 12", matchAreaCode("광주") === "12"],
  ["Jeju -> 50", matchAreaCode("Jeju") === "50"],
  ["경주 is not a province", matchAreaCode("경주") === null],
  ["festival window next month (KST)", JSON.stringify(festivalWindow("next", new Date("2026-11-09T10:00:00Z"))) === JSON.stringify({ eventStartDate: "20261201", eventEndDate: "20261231" })],
];
for (const [name, ok] of off) { console.log(ok ? "PASS" : "FAIL", name); if (!ok) fail++; }

// Browse (1 call): 강원 festivals must come back via legal-dong codes, dated.
try {
  const b = await browse(env, "ko", { region: "51", cat: "festival", when: "upcoming" });
  const ok = b.ok && b.items.length > 0 && b.items.every((x) => x.start);
  console.log(ok ? "PASS" : "FAIL", "browse 강원 festival ->", b.ok ? `${b.items.length} items` : b.error);
  if (!ok) fail++;
} catch (e) { console.log("ERROR browse", e.message); fail++; }

console.log(fail ? `\n${fail} case(s) failed` : "\nall cases passed");
process.exit(fail ? 1 : 0);
