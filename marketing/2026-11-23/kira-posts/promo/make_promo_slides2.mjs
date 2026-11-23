// C4 (K-ETA waiver ends Dec 31, 2026) and R2 (instant report demo), 1080x1350.
// Facts: keta-exemption, keta-visa-distinction (VERIFIED 2026-11-16). R2 uses real ktriphub screenshots (report for Myeongdong;
// header photo = Frank Schulenburg / Wikimedia Commons CC BY-SA 4.0, credited in caption; map © OpenStreetMap contributors).
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const img = (f) => "file:///" + path.join(here, "r2", "crops", f + ".jpg").split(path.sep).join("/");
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
  c4: { asof: "as of Nov 16, 2026 · k-eta.go.kr", slides: [
    `<div class="k">Flying to Korea in 2027?</div><h1>Check this before you book</h1><div class="sub">The temporary K-ETA waiver has an end date.</div>`,
    `<div class="k">1 · The waiver</div><h2>Ends Dec 31, 2026</h2>${rows([["Designated countries & regions only", "Not every visa-free passport is on the list"]])}<div class="note">No extension announced as of Nov 16, 2026 — check the official notice for later dates.</div>`,
    `<div class="k">2 · Don't mix them up</div><h2>Visa-free ≠ K-ETA-exempt</h2>${rows([["Visa-free entry", "You may still need K-ETA"], ["K-ETA exemption", "Only the designated list, until Dec 31, 2026"]])}`,
    `<div class="k">3 · Need a visa?</div><h2>K-ETA doesn't replace it</h2>${rows([["🇮🇩 Indonesian ordinary passports", "Apply for a tourist visa — K-ETA isn't an alternative"]])}`,
    `<div class="k">Check your passport</div><h1>Visa or K-ETA? Find out in a minute</h1><div class="sub">With the official links — free on ktriphub, run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
  r2: { asof: "ktriphub instant report · data: TourAPI", slides: [
    `<div class="k">Any place in Korea</div><h1>Type a place, get a travel report</h1>${shot("search")}`,
    `<div class="k">Example · Myeongdong</div><h2>Overview with the source</h2>${shot("header")}`,
    `<div class="k">Location & map</div><h2>Sights, food & stays nearby</h2>${shot("map")}`,
    `<div class="k">Things to see</div><h2>Each card says where it came from</h2>${shot("sights")}`,
    `<div class="k">Try it free</div><h1>No sign-up. 12 languages.</h1><div class="sub">Built from Korea Tourism Organization data (TourAPI) — run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
};
for (const [id, d] of Object.entries(decks)) {
  const out = path.join(here, id, "html"); fs.mkdirSync(out, { recursive: true });
  d.slides.forEach((s, i) => fs.writeFileSync(path.join(out, `slide${i + 1}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${s}<div class="foot"><span><b>ktriphub.com</b> · ${d.asof}</span><span>${i + 1} / ${d.slides.length}</span></div></body></html>`));
}
console.log("ok");
