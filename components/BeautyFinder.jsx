"use client";
// Beauty-by-area explorer for the K-beauty guide: pick a district and a category
// (cosmetics / hair & makeup / clinics) to see real places on a keyless Google
// Maps embed, with the right guide/booking action. Fixes "clicked a beauty area,
// got a generic destination page" by keeping beauty context on-page.
import { useState } from "react";
import ui from "../data/beautyfinder-ui.json";
import { withAff, creatripLocalize } from "../lib/booking";

const G_HL = { zh: "zh-CN", "zh-TW": "zh-TW" };
const DISTRICTS = [
  { key: "myeongdong", name: "Myeongdong" },
  { key: "hongdae", name: "Hongdae" },
  { key: "gangnam", name: "Gangnam" },
  { key: "seongsu", name: "Seongsu" },
];
const CATS = [
  { key: "cosmetics", icon: "🧴", q: "Olive Young cosmetics" },
  { key: "hair", icon: "💇", q: "makeup hair studio" },
  { key: "clinics", icon: "🏥", q: "dermatology skin clinic" },
];
const CREATRIP = "https://creatrip.com/en/landing-area/4";
const MEDICAL_KOREA = "https://www.medicalkorea.or.kr";

export default function BeautyFinder({ locale }) {
  const t = ui[locale] || ui.en;
  const ghl = G_HL[locale] || locale || "en";
  const [district, setDistrict] = useState("myeongdong");
  const [cat, setCat] = useState("cosmetics");
  const d = DISTRICTS.find((x) => x.key === district) || DISTRICTS[0];
  const c = CATS.find((x) => x.key === cat) || CATS[0];
  const mapQ = `${c.q} ${d.name}, Seoul`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQ)}&hl=${ghl}&z=15&output=embed`;

  const ctas = {
    cosmetics: [{ label: t.book, href: withAff(creatripLocalize(CREATRIP, locale), "creatrip"), sponsored: true }],
    hair: [
      { label: t.book, href: withAff(creatripLocalize(CREATRIP, locale), "creatrip"), sponsored: true },
      { label: t.makeupGuide, href: `/${locale}/guides/idol-makeup/` },
    ],
    clinics: [
      { label: t.verify, href: MEDICAL_KOREA },
      { label: t.safety, href: `/${locale}/guides/plastic-surgery-safety/` },
    ],
  }[cat];

  return (
    <div className="bfind">
      <div className="bfind-head">
        <h2 className="bfind-title">🗺️ {t.heading}</h2>
        <p className="bfind-intro">{t.intro}</p>
      </div>
      <div className="bfind-tabs" role="tablist" aria-label={t.heading}>
        {DISTRICTS.map((x) => (
          <button key={x.key} type="button" className={`bfind-tab${x.key === district ? " is-on" : ""}`} aria-pressed={x.key === district} onClick={() => setDistrict(x.key)}>{x.name}</button>
        ))}
      </div>
      <div className="bfind-cats" role="tablist">
        {CATS.map((x) => (
          <button key={x.key} type="button" className={`bfind-cat${x.key === cat ? " is-on" : ""}`} aria-pressed={x.key === cat} onClick={() => setCat(x.key)}>
            <span aria-hidden="true">{x.icon}</span> {t.cats[x.key]}
          </button>
        ))}
      </div>
      <div className="bfind-map">
        <iframe key={mapSrc} title={mapQ} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <div className="bfind-cta">
        {ctas.map((a, i) => {
          const internal = a.href.startsWith("/");
          return (
            <a key={i} className="bfind-btn" href={a.href} target={internal ? undefined : "_blank"} rel={a.sponsored ? "sponsored nofollow noopener" : internal ? undefined : "noopener noreferrer"}>
              {a.label} <span aria-hidden="true">↗</span>
            </a>
          );
        })}
      </div>
      {cat === "clinics" && <p className="bfind-note">{t.clinicNote}</p>}
    </div>
  );
}
