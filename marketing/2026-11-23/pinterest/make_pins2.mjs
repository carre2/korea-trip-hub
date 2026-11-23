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
  { id: "p11", shot: "destinations", accent: "#7FD4FF", k: "Where to go in Korea", h: "Destinations by city — the real favorites", sub: "Real places grouped by city, from Myeongdong to Gyeongbokgung — with the source for every popularity figure.", cta: "Explore destinations →" },
  { id: "p12", shot: "food", accent: "#FFB86B", k: "Eat & make", h: "Korean food to try first — and where", sub: "Where to eat, how to find top-rated spots in English, and hands-on cooking classes.", cta: "Food guide →" },
  { id: "p13", shot: "stay", accent: "#9BE15D", k: "Where to stay", h: "Pick the right area in each Korean city", sub: "Seoul, Busan, Jeju and more — areas compared by vibe, not just price.", cta: "Compare areas →" },
  { id: "p14", shot: "money", accent: "#FFD166", k: "Before you go", h: "Money in Korea: cards, cash & exchange", sub: "Where cards work, when you still need cash, and how to change money without losing out.", cta: "Money guide →" },
  { id: "p15", shot: "weather", accent: "#7FE3C4", k: "Best time to visit", h: "Korea weather by season — what to pack", sub: "Spring blossoms, summer monsoon, autumn foliage and dry, cold winters — plan your month.", cta: "Weather guide →" },
  { id: "p16", shot: "itinerary", accent: "#C9A7FF", k: "Trip planner", h: "Ready-made Korea itineraries you can edit", sub: "Seoul, Busan, Jeju and Gyeongju day-by-day plans — or build your own for free.", cta: "See itineraries →" },
  { id: "p17", shot: "safety", accent: "#FF8FA3", k: "Practical guide", h: "Is Korea safe? A traveler's safety guide", sub: "What to know about scams, night-time travel, solo trips and the help lines to save.", cta: "Safety guide →" },
  { id: "p18", shot: "kpop", accent: "#FF9ECF", k: "K-culture", h: "K-pop trip in Korea: venues, shows & fan spots", sub: "Music shows, agency areas and concert planning — a visiting fan's guide.", cta: "K-pop guide →" },
  { id: "p19", shot: "zhtw", accent: "#2BC7B2", k: "韓國自由行 · 繁體中文", h: "用自己的步調探索韓國", sub: "簽證與入境、機場交通、網路與付款、行程規劃 — 免費使用的繁體中文韓國旅遊資訊。", cta: "繁體中文版 →" },
  { id: "p20", shot: "idguide", accent: "#FFB86B", k: "🇮🇩 Dari Indonesia", h: "Liburan ke Korea dari Indonesia: panduan lengkap", sub: "Dokumen masuk, anggaran dalam IDR, dan itinerary hari pertama — dalam Bahasa Indonesia.", cta: "Baca panduan →" },
];
pins.forEach((p) => fs.writeFileSync(path.join(out, p.id + ".html"), pin(p)));
console.log("wrote", pins.length, "pins");
