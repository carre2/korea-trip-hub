"use client";
import { useEffect, useState } from "react";

// Nationality-personalized panel for visa-REQUIRED guides (proposal A2):
//  • Live "your money in Korea" rate (open.er-api.com — free, no key, CORS *),
//    shown as indicative with a disclaimer (no stored/invented FX numbers).
//  • The traveler's own embassy in Korea (verified contact from data/visa-local.json),
//    for emergencies after arrival, always with the official link + a confirm note.
export default function VisaLocalInfo({ cur, embassy, labels }) {
  const L = labels || {};
  const [txt, setTxt] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!cur) return;
    let on = true;
    fetch("https://open.er-api.com/v6/latest/KRW")
      .then((r) => r.json())
      .then((d) => {
        if (!on) return;
        const per = d?.rates?.[cur]; // units of `cur` per 1 KRW
        if (!per) { setErr(true); return; }
        const krwPerUnit = 1 / per;
        const one = krwPerUnit >= 1
          ? `1 ${cur} ≈ ${krwPerUnit.toFixed(krwPerUnit >= 100 ? 0 : 1)} KRW`
          : `1,000 ${cur} ≈ ${Math.round(krwPerUnit * 1000).toLocaleString()} KRW`;
        const local = Math.round(per * 10000).toLocaleString();
        setTxt(`${one}  ·  ₩10,000 ≈ ${local} ${cur}`);
      })
      .catch(() => { if (on) setErr(true); });
    return () => { on = false; };
  }, [cur]);

  return (
    <section className="visalocal">
      {cur && (
        <div className="vl-card vl-money">
          <div className="vl-h">💱 {L.currencyTitle || "Your money in Korea"}</div>
          <div className="vl-rate">{err ? `1 ${cur} → KRW` : (txt || (L.rateLoading || "Loading live rate…"))}</div>
          <p className="vl-note">{L.rateNote}</p>
        </div>
      )}
      {embassy && (
        <div className="vl-card vl-embassy">
          <div className="vl-h">🏛️ {L.embassyTitle || "Your embassy in Korea"}</div>
          <b className="vl-emb-name">{embassy.name}</b>
          <dl className="vl-dl">
            {embassy.addr && (<><dt>{L.addrLabel || "Address"}</dt><dd>{embassy.addr}</dd></>)}
            {embassy.tel && (<><dt>{L.telLabel || "Phone"}</dt><dd><a href={`tel:${embassy.tel.replace(/[^+\d]/g, "")}`}>{embassy.tel}</a></dd></>)}
          </dl>
          {embassy.url && (
            <a className="vl-emb-link" href={embassy.url} target="_blank" rel="noopener noreferrer">
              {L.officialSite || "Official site"} →
            </a>
          )}
          <p className="vl-note">{L.embassyNote}</p>
        </div>
      )}
    </section>
  );
}
