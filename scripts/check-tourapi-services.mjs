// Which TourAPI language services does our key work with right now?
// One cheap call (ldongCode2, 1 row) per service. NOT part of prebuild.
//   node scripts/check-tourapi-services.mjs
// OK      -> approved; add the locale to APPROVED in worker/tourapi.mjs
// 403/r30 -> not applied/approved for this key (활용신청 필요)
// 429/r22 -> approved but today's quota for this operation is used up
import fs from "node:fs";

const SERVICES = {
  ko: "KorService2", en: "EngService2", ja: "JpnService2", zh: "ChsService2",
  "zh-TW": "ChtService2", fr: "FreService2", es: "SpnService2", ru: "RusService2", de: "GerService2",
};

function readKey() {
  if (process.env.TOURAPI_KEY) return process.env.TOURAPI_KEY.trim();
  try {
    const m = fs.readFileSync(new URL("../.dev.vars", import.meta.url), "utf8").match(/^\s*TOURAPI_KEY\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch { /* no .dev.vars */ }
  return "";
}

const key = readKey();
if (!key) { console.log("SKIP: no TOURAPI_KEY (set env var or .dev.vars)"); process.exit(0); }

for (const [locale, svc] of Object.entries(SERVICES)) {
  const qs = new URLSearchParams({ serviceKey: key, MobileOS: "ETC", MobileApp: "ktriphub", _type: "json", numOfRows: "1", pageNo: "1" });
  let line;
  try {
    const res = await fetch(`https://apis.data.go.kr/B551011/${svc}/ldongCode2?${qs}`);
    const text = await res.text();
    const rc = (text.match(/returnReasonCode"?\s*[:>]\s*"?(\d{1,3})/) || [])[1];
    line = res.ok && /"resultCode"\s*:\s*"0000"/.test(text) ? "OK" : `${res.status}${rc ? "/r" + rc : ""}`;
  } catch (e) {
    line = "ERROR " + e.message;
  }
  console.log(locale.padEnd(6), svc.padEnd(12), line);
}
