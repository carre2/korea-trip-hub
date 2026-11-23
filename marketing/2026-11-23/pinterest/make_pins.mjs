// ktriphub Pinterest pins (1000x1500, 2:3). Real site screenshots only (no AI images).
// Numbers come from data/facts.json VERIFIED: festival-*-2026/2027 (2026-11-03), visa-indonesia-fees/-processing (2026-11-16),
// visa-indonesia-payment, keta-exemption, keta-visa-distinction (2026-11-16),
// arex-express / airport-bus (2026-11-03), sim-options (2026-08-04), tmoney-where-to-buy (2026-08-03).
// render: node ../../tools/capture.mjs png p01=file:///.../html/p01.html#1000x1500 ...
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const out = path.join(here, "html");
fs.mkdirSync(out, { recursive: true });
const crop = (n) => "file:///" + path.join(here, "crops", n + ".jpg").replace(/\\/g, "/");

const css = (accent) => `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1000px;height:1500px;overflow:hidden}
body{background:linear-gradient(165deg,#0d0f16 0%,#17223c 100%);color:#fff;font-family:"Segoe UI",Arial,sans-serif;padding:70px 70px 0;display:flex;flex-direction:column}
.k{color:${accent};font-weight:800;letter-spacing:.12em;font-size:28px;text-transform:uppercase}
h1{font-size:70px;line-height:1.07;font-weight:800;margin-top:20px;letter-spacing:-.01em}
.sub{font-size:32px;color:#c9d0e0;margin-top:18px;line-height:1.35}
.rows{margin-top:30px;display:flex;flex-direction:column;gap:16px}
.row{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);border-radius:22px;padding:18px 26px}
.row .l{font-size:25px;color:#c9d0e0}
.row .v{font-size:36px;font-weight:800;margin-top:2px;line-height:1.2}
.note{font-size:23px;color:#9aa2b6;margin-top:16px;line-height:1.35}
.shot{margin-top:auto;align-self:center;width:760px;height:560px;border-radius:40px 40px 0 0;border:10px solid #2a3350;border-bottom:none;overflow:hidden;background:#0d0f16;position:relative}
.shot img{width:100%;display:block}
.bar{position:absolute;left:0;right:0;bottom:0;height:96px;background:linear-gradient(transparent,#0d0f16)}
.url{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);background:${accent};color:#0d0f16;font-weight:800;font-size:30px;padding:14px 34px;border-radius:999px;white-space:nowrap}
`;
const pin = (p) => `<!doctype html><html><head><meta charset="utf-8"><style>${css(p.accent)}</style></head><body>
<div class="k">${p.k}</div><h1>${p.h}</h1>${p.sub ? `<div class="sub">${p.sub}</div>` : ""}
${p.rows ? `<div class="rows">${p.rows.map(([l, v]) => `<div class="row">${l ? `<div class="l">${l}</div>` : ""}<div class="v">${v}</div></div>`).join("")}</div>` : ""}
${p.note ? `<div class="note">${p.note}</div>` : ""}
<div class="shot"><img src="${crop(p.shot)}"><div class="bar"></div><div class="url">${p.cta}</div></div></body></html>`;

export const pins = [
  { id: "p01", shot: "festivals", accent: "#FFB86B", k: "Korea winter 2026–27", h: "3 winter festivals worth planning around",
    rows: [["Seoul Lantern Festival · Cheonggyecheon, Seoul", "Dec 11, 2026 – Jan 31, 2027"], ["Garden of Morning Calm lights · Gapyeong", "Dec 4, 2026 – Mar 14, 2027"], ["Hwacheon Sancheoneo Ice Festival · Gangwon", "Jan 9 – 31, 2027"]],
    note: "Organizer dates checked Nov 3–16, 2026 — confirm on the official pages before you go.", cta: "All festivals → ktriphub.com" },
  { id: "p02", shot: "winter", accent: "#7FD4FF", k: "Seasonal guide", h: "Korea in winter: what to expect, pack & do",
    sub: "Cold, dry days, snow spots, hot springs and glittering light festivals — what to wear and where to go.", cta: "Read the winter guide →" },
  { id: "p03", shot: "idvisa", accent: "#2BC7B2", k: "🇮🇩 Paspor Indonesia · 2026", h: "Visa turis Korea: biaya, waktu, cara bayar",
    rows: [["Single entry (mulai 1 Jul 2026)", "IDR 920.000 <span style='font-size:24px;color:#c9d0e0'>= 680.000 + KVAC 240.000</span>"], ["Multiple entry", "IDR 1.770.000"], ["Lama proses di KVAC Jakarta", "10 hari kerja (single) · 7 (multiple)"], ["Bayar non-tunai", "Transfer · kartu debit · QRIS"]],
    note: "Per 16 Nov 2026. Selalu cek situs resmi KVAC Jakarta (visaforkorea-in.com).", cta: "Panduan lengkap →" },
  { id: "p04", shot: "keta", accent: "#FF8FA3", k: "Flying to Korea in 2027?", h: "The K-ETA waiver ends Dec 31, 2026",
    rows: [["", "Covers designated countries/regions only"], ["", "Visa-free ≠ K-ETA-exempt"], ["", "Need a visa? K-ETA doesn't replace it"]],
    note: "As of Nov 16, 2026 · official notice: k-eta.go.kr", cta: "Check your passport →" },
  { id: "p05", shot: "airport", accent: "#9BE15D", k: "Just landed at Incheon?", h: "Incheon Airport → Seoul: 3 ways in",
    rows: [["AREX Express · non-stop to Seoul Station", "~43 min (T1) · ~51 min (T2)"], ["Airport bus · depends on route & traffic", "~60–90 min"], ["Taxi", "Tips & fares in the guide"]],
    cta: "Airport guide →" },
  { id: "p06", shot: "sim", accent: "#C9A7FF", k: "Day 1 in Korea", h: "Get online: eSIM, SIM or pocket Wi-Fi?",
    rows: [["eSIM", "Install before you fly — live on landing"], ["Physical SIM", "Needs an unlocked phone"], ["Pocket Wi-Fi", "Best shared by a group"]],
    note: "Carriers: SKT · KT · LG U+", cta: "Compare options →" },
  { id: "p07", shot: "transit", accent: "#FFD166", k: "Getting around Korea", h: "One card for subway & bus: T-money",
    rows: [["Buy & top up at", "CU · GS25 · 7-Eleven · Emart24"], ["", "…or the machines in subway stations"]],
    cta: "Transit guide →" },
  { id: "p08", shot: "report", accent: "#B79BFF", k: "Any place in Korea", h: "Type a place, get an instant travel report",
    sub: "Map, nearby food, stays and sights — built from Korea Tourism Organization data (TourAPI), with the source on every card.", cta: "Try it free →" },
  { id: "p09", shot: "beauty", accent: "#FF9ECF", k: "K-beauty guide", h: "K-beauty shopping in Seoul: a first-timer's guide",
    sub: "Where to shop for Korean skincare and makeup, and how tax refunds work.", cta: "Read the guide →" },
  { id: "p10", shot: "etiquette", accent: "#7FE3C4", k: "Culture guide", h: "Korea etiquette: do's and don'ts for visitors",
    sub: "Shoes off at home, two-hand gestures, dining and public-transport manners — the basics that help you fit in.", cta: "Read the guide →" },
];
pins.forEach((p) => fs.writeFileSync(path.join(out, p.id + ".html"), pin(p)));
console.log("wrote", pins.length, "pins");
