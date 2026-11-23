// C4 (K-ETA waiver ends Dec 31, 2026) and R2 (instant report demo), 1080x1350.
// Facts: keta-exemption, keta-visa-distinction (VERIFIED 2026-11-16). R2 uses real ktriphub screenshots (report for Myeongdong;
// header photo = Frank Schulenburg / Wikimedia Commons CC BY-SA 4.0, credited in caption; map © OpenStreetMap contributors).
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const img = (f) => "file:///" + path.join(here, "shared", f + ".jpg").split(path.sep).join("/");
const css = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{background:linear-gradient(160deg,#0d0f16 0%,#16213a 100%);color:#fff;font-family:"Segoe UI",Arial,sans-serif;padding:96px 88px;display:flex;flex-direction:column}
.k{color:#2BC7B2;font-weight:800;letter-spacing:.12em;font-size:30px;text-transform:uppercase}
h1{font-size:80px;line-height:1.08;font-weight:800;margin-top:28px}
h2{font-size:60px;line-height:1.1;font-weight:800;margin-top:22px}
.sub{font-size:36px;color:#c9d0e0;margin-top:24px;line-height:1.35}
.rows{margin-top:48px;display:flex;flex-direction:column;gap:22px}
.row{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:28px;padding:28px 34px}
.row .v{font-size:44px;font-weight:800;line-height:1.2}
.row .l{font-size:29px;color:#c9d0e0;margin-top:8px}
.note{font-size:30px;color:#9aa2b6;margin-top:24px;line-height:1.4}
.shot{margin-top:40px;align-self:center;width:820px;border-radius:32px;border:8px solid #2a3350;overflow:hidden}
.shot img{width:100%;display:block}
.foot{margin-top:auto;display:flex;justify-content:space-between;font-size:26px;color:#9aa2b6}
.foot b{color:#fff}
.cta{margin-top:60px;background:#2BC7B2;color:#0d0f16;border-radius:999px;padding:30px 44px;font-size:42px;font-weight:800;align-self:flex-start}`;
const rows = (r) => `<div class="rows">${r.map(([v, l]) => `<div class="row"><div class="v">${v}</div>${l ? `<div class="l">${l}</div>` : ""}</div>`).join("")}</div>`;
const shot = (f) => `<div class="shot"><img src="${img(f)}"></div>`;
const decks = {
  r7: { asof: "as of Nov 3, 2026 · official festival page", slides: [
    `<div class="k">Opens tomorrow · Seoul</div><h1>Seoul Lantern Festival 🏮</h1><div class="sub">Glowing lanterns along Cheonggyecheon Stream, all winter long.</div>`,
    `<div class="k">When</div><h2>Dec 11, 2026 – Jan 31, 2027</h2>${rows([["Cheonggyecheon Stream", "Cheonggye Plaza → Samilgyo Bridge, Jung-gu"]])}<div class="note">Dates from the organizer as of Nov 3, 2026 — check the official page before you go.</div>`,
    `<div class="k">More this winter</div><h2>Festivals with maps & official links</h2>${shot("festivals")}`,
    `<div class="k">Plan the night</div><h2>Make it a winter evening</h2>${rows([["Walk the stream after dark", "Dress warm — it's a long, open-air walk"], ["Find food & stays nearby", "Use the instant report for the area"]])}`,
    `<div class="k">All winter festivals</div><h1>Dates, maps & official links</h1><div class="sub">Free on ktriphub — run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
  c3: { asof: "ktriphub first-day guide", slides: [
    `<div class="k">Day 1 in Korea</div><h1>Get online + get a transit card</h1><div class="sub">The two things to sort before you leave the airport.</div>`,
    `<div class="k">1 · Internet</div><h2>eSIM, SIM or pocket Wi-Fi?</h2>${rows([["eSIM", "Install before you fly — live on landing"], ["Physical SIM", "Needs an unlocked phone"], ["Pocket Wi-Fi", "Best shared by a group"]])}<div class="note">Carriers: SKT · KT · LG U+</div>`,
    `<div class="k">Compare</div><h2>Which one fits your trip</h2>${shot("sim")}`,
    `<div class="k">2 · T-money</div><h2>One card for subway & bus</h2>${rows([["Buy & top up at", "CU · GS25 · 7-Eleven · Emart24"], ["", "…or subway station machines"]])}`,
    `<div class="k">First-day guide</div><h1>Internet, transit & money tips</h1><div class="sub">Free on ktriphub — run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
  r6: { asof: "as of Nov 16, 2026 · confirm with the organizer", slides: [
    `<div class="k">No plan yet?</div><h1>Pick a region, then a category</h1><div class="sub">Festivals, food, stays and sights — start from the map.</div>`,
    `<div class="k">Search · Map · Step by step</div><h2>Three ways to start</h2>${shot("search")}`,
    `<div class="k">See it on the map</div><h2>Sights, food & stays nearby</h2>${shot("map")}`,
    `<div class="k">Example · Gangwon</div><h2>Hwacheon Sancheoneo Ice Festival</h2>${rows([["Frozen Hwacheoncheon Stream, Gangwon", "Jan 9 – 31, 2027"]])}<div class="note">Organizer dates as of Nov 16, 2026 — confirm before you go.</div>`,
    `<div class="k">Try the map</div><h1>Find your winter trip</h1><div class="sub">Free on ktriphub — run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
  w1: { asof: "ktriphub seasonal guide", slides: [
    `<div class="k">First winter trip?</div><h1>Korea in winter: what to expect</h1><div class="sub">Cold, dry days, snow spots, hot springs and light festivals.</div>`,
    `<div class="k">The guide</div><h2>What to pack & where to go</h2>${shot("winter")}`,
    `<div class="k">Pack smart</div><h2>Layers win</h2>${rows([["Warm outer layer", "Plus gloves, hat and a scarf"], ["Comfortable shoes", "You'll walk a lot, sometimes on ice"]])}`,
    `<div class="k">Winter favorites</div><h2>Snow, hot springs & lights</h2>${rows([["Light festivals", "Evenings in the city"], ["Snowy palaces & mountains", "Go early for quiet views"]])}`,
    `<div class="k">Full winter guide</div><h1>Packing list & where to go</h1><div class="sub">Free on ktriphub — run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
};
for (const [id, d] of Object.entries(decks)) {
  const out = path.join(here, id, "html"); fs.mkdirSync(out, { recursive: true });
  d.slides.forEach((s, i) => fs.writeFileSync(path.join(out, `slide${i + 1}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${s}<div class="foot"><span><b>ktriphub.com</b> · ${d.asof}</span><span>${i + 1} / ${d.slides.length}</span></div></body></html>`));
}
console.log("ok");
