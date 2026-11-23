// C1 carousel "Korea visa for Indonesian passports — 2026 cheat sheet" (6 slides, 1080x1350).
// Every number comes from data/facts.json (VERIFIED): visa-indonesia-fees, -processing,
// -payment, kvac-jakarta-hours (verified 2026-11-08/09). Re-verify after 2026-12-05.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const out = path.join(here, "html");
fs.mkdirSync(out, { recursive: true });

const css = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px}
body{background:linear-gradient(160deg,#0d0f16 0%,#16213a 100%);color:#fff;font-family:"Segoe UI",Arial,sans-serif;padding:96px 88px;display:flex;flex-direction:column}
.k{color:#2BC7B2;font-weight:800;letter-spacing:.12em;font-size:30px;text-transform:uppercase}
h1{font-size:82px;line-height:1.08;font-weight:800;margin-top:28px;letter-spacing:-.01em}
h2{font-size:64px;line-height:1.1;font-weight:800;margin-top:24px}
.sub{font-size:36px;color:#c9d0e0;margin-top:26px;line-height:1.35}
.rows{margin-top:56px;display:flex;flex-direction:column;gap:26px}
.row{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:28px;padding:30px 36px}
.row .l{font-size:30px;color:#c9d0e0}
.row .v{font-size:52px;font-weight:800;margin-top:6px}
.row .v small{font-size:32px;font-weight:600;color:#c9d0e0}
.big{font-size:120px;font-weight:800;color:#2BC7B2;line-height:1}
.note{font-size:30px;color:#9aa2b6;margin-top:22px;line-height:1.4}
.foot{margin-top:auto;display:flex;justify-content:space-between;font-size:26px;color:#9aa2b6}
.foot b{color:#fff}
.cta{margin-top:60px;background:#2BC7B2;color:#0d0f16;border-radius:999px;padding:30px 44px;font-size:42px;font-weight:800;align-self:flex-start}
`;
const page = (n, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${body}
<div class="foot"><span><b>ktriphub.com</b> · as of Nov 8–9, 2026</span><span>${n} / 6</span></div></body></html>`;

const slides = [
  `<div class="k">Kira's Korea notes</div><h1>Korea visa for Indonesian passports</h1><div class="sub">2026 cheat sheet — cost, time, payment, hours.<br>Save this before you apply.</div>`,
  `<div class="k">Cost · from Jul 1, 2026</div><h2>Visa fee + KVAC service fee</h2>
   <div class="rows">
    <div class="row"><div class="l">Single entry, short-term</div><div class="v">IDR 920,000 <small>= 680,000 + KVAC 240,000</small></div></div>
    <div class="row"><div class="l">Multiple entry</div><div class="v">IDR 1,770,000 <small>= 1,530,000 + KVAC 240,000</small></div></div>
   </div><div class="note">Express and optional services cost extra. Check the current fee table before applying.</div>`,
  `<div class="k">How long?</div><h2>KVAC Jakarta estimates</h2>
   <div class="rows">
    <div class="row"><div class="l">Single / double visa</div><div class="v">10 working days</div></div>
    <div class="row"><div class="l">Multiple visa</div><div class="v">7 working days</div></div>
    <div class="row"><div class="l">Eligible C-3 express</div><div class="v">5 working days</div></div>
   </div><div class="note">Submission day counts; holidays don't. Extra documents or interviews can take longer.</div>`,
  `<div class="k">How to pay</div><h2>KVAC Jakarta is cashless in 2026</h2>
   <div class="rows">
    <div class="row"><div class="v">Bank transfer</div></div>
    <div class="row"><div class="v">Debit card</div></div>
    <div class="row"><div class="v">QRIS</div></div>
   </div><div class="note">The visa fee and the KVAC service charge are paid separately.</div>`,
  `<div class="k">When to go</div><h2>Monday – Friday, except holidays</h2>
   <div class="rows">
    <div class="row"><div class="l">Submit your application</div><div class="v">09:00 – 15:00 WIB</div></div>
    <div class="row"><div class="l">Collect your passport</div><div class="v">12:00 – 17:00 WIB</div></div>
   </div><div class="note">Submission and collection have different hours. Check holiday notices before you go.</div>`,
  `<div class="k">Full checklist</div><h1>Documents, Jeju visa-free rules & official links</h1><div class="sub">Everything with its official source on ktriphub — free, run by the team behind Kira.</div><div class="cta">Link in bio →</div><div class="note">Always confirm on the KVAC Jakarta site: visaforkorea-in.com</div>`,
];
slides.forEach((s, i) => fs.writeFileSync(path.join(out, `slide${i + 1}.html`), page(i + 1, s)));
console.log("wrote", slides.length, "slides to", out);
