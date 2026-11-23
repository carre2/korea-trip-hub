// Kira promo slideshows C2 (KVAC Jakarta checklist) and R4 (Incheon -> Seoul), 1080x1350, same style as C1.
// Facts (data/facts.json VERIFIED): visa-indonesia-documents (2026-11-16); arex-express, airport-bus (2026-11-03).
import fs from "node:fs";
import path from "node:path";
const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const css = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px}
body{background:linear-gradient(160deg,#0d0f16 0%,#16213a 100%);color:#fff;font-family:"Segoe UI",Arial,sans-serif;padding:96px 88px;display:flex;flex-direction:column}
.k{color:#2BC7B2;font-weight:800;letter-spacing:.12em;font-size:30px;text-transform:uppercase}
h1{font-size:80px;line-height:1.08;font-weight:800;margin-top:28px}
h2{font-size:62px;line-height:1.1;font-weight:800;margin-top:24px}
.sub{font-size:36px;color:#c9d0e0;margin-top:26px;line-height:1.35}
.rows{margin-top:48px;display:flex;flex-direction:column;gap:22px}
.row{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:28px;padding:26px 34px}
.row .l{font-size:29px;color:#c9d0e0}
.row .v{font-size:44px;font-weight:800;margin-top:6px;line-height:1.2}
.note{font-size:30px;color:#9aa2b6;margin-top:24px;line-height:1.4}
.foot{margin-top:auto;display:flex;justify-content:space-between;font-size:26px;color:#9aa2b6}
.foot b{color:#fff}
.cta{margin-top:60px;background:#2BC7B2;color:#0d0f16;border-radius:999px;padding:30px 44px;font-size:42px;font-weight:800;align-self:flex-start}`;
const rows = (r) => `<div class="rows">${r.map(([l, v]) => `<div class="row">${l ? `<div class="l">${l}</div>` : ""}<div class="v">${v}</div></div>`).join("")}</div>`;
const decks = {
  c2: { asof: "as of Nov 16, 2026", slides: [
    `<div class="k">Kira's Korea notes</div><h1>KVAC Jakarta tourist visa checklist</h1><div class="sub">Documents for Indonesian passports.<br>Save this before your appointment.</div>`,
    `<div class="k">Everyone</div><h2>The basics</h2>${rows([["Application form", "+ 1 photo, 3.5 × 4.5 cm, white background"], ["Family card", "Copy of Kartu Keluarga"]])}`,
    `<div class="k">By your job</div><h2>Proof of what you do</h2>${rows([["Employee", "Original employment certificate"], ["Student", "Original enrollment certificate"], ["Business owner", "Copy of business license"], ["Homemaker / retiree", "Copy of KTP"]])}`,
    `<div class="k">Money proof</div><h2>Bank statements</h2>${rows([["Last 3 months", "Original transaction details with the bank's wet stamp"], ["Or", "Credit-card statements and other evidence"]])}<div class="note">Your category may need more — follow the official checklist and any extra request.</div>`,
    `<div class="k">Full checklist</div><h1>Costs, timing & official links</h1><div class="sub">All on ktriphub — free, run by the team behind Kira.</div><div class="cta">Link in bio →</div><div class="note">Always confirm on the KVAC Jakarta site: visaforkorea-in.com</div>`,
  ]},
  r4: { asof: "as of Nov 3, 2026", slides: [
    `<div class="k">Just landed?</div><h1>Incheon Airport → Seoul: 3 ways in</h1><div class="sub">Train, bus or taxi — pick what fits your bags and your budget.</div>`,
    `<div class="k">1 · Train</div><h2>AREX Express</h2>${rows([["Non-stop to Seoul Station", "~43 min from T1"], ["", "~51 min from T2"]])}`,
    `<div class="k">2 · Bus</div><h2>Airport bus</h2>${rows([["Depends on route & traffic", "~60–90 min"], ["Pay with", "Cash · T-money · card"]])}`,
    `<div class="k">3 · Taxi</div><h2>Door to door</h2>${rows([["", "Easiest with luggage or late at night"], ["", "Fares & tips are in the airport guide"]])}`,
    `<div class="k">Airport guide</div><h1>Routes, fares & first-day tips</h1><div class="sub">On ktriphub — free, run by the team behind Kira.</div><div class="cta">Link in bio →</div>`,
  ]},
};
for (const [id, d] of Object.entries(decks)) {
  const out = path.join(here, id, "html"); fs.mkdirSync(out, { recursive: true });
  d.slides.forEach((s, i) => fs.writeFileSync(path.join(out, `slide${i + 1}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${s}<div class="foot"><span><b>ktriphub.com</b> · ${d.asof}</span><span>${i + 1} / ${d.slides.length}</span></div></body></html>`));
}
console.log("ok");
