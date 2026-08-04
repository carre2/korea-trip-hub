"use client";

// Live indicative exchange rates → Korean won (KRW).
// Client-side fetch from open.er-api.com (free, no key, CORS-enabled). Shows the
// mid-market rate with the source's update time. HARNESS: this is real fetched
// data, clearly labelled indicative — booths, ATMs and cards use their own rates.
import { useEffect, useState } from "react";

// Currencies to show, with a display unit (small-unit currencies shown per 100 / 1,000).
const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", unit: 1 },
  { code: "EUR", flag: "🇪🇺", unit: 1 },
  { code: "JPY", flag: "🇯🇵", unit: 100 },
  { code: "CNY", flag: "🇨🇳", unit: 1 },
  { code: "TWD", flag: "🇹🇼", unit: 1 },
  { code: "GBP", flag: "🇬🇧", unit: 1 },
  { code: "THB", flag: "🇹🇭", unit: 1 },
  { code: "AUD", flag: "🇦🇺", unit: 1 },
  { code: "MYR", flag: "🇲🇾", unit: 1 },
  { code: "VND", flag: "🇻🇳", unit: 1000 },
  { code: "IDR", flag: "🇮🇩", unit: 1000 },
  { code: "SGD", flag: "🇸🇬", unit: 1 },
];

function fmt(n) {
  return n >= 100 ? Math.round(n).toLocaleString("en-US") : n.toFixed(1);
}

export default function FxRates({ labels }) {
  const t = labels || {};
  const [rates, setRates] = useState(null);
  const [updated, setUpdated] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("https://open.er-api.com/v6/latest/KRW")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.result !== "success" || !d.rates) { setErr(true); return; }
        setRates(d.rates);
        setUpdated(d.time_last_update_utc || "");
      })
      .catch(() => !cancelled && setErr(true));
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fx">
      <div className="fx-head">
        <b>{t.title || "Live exchange rate → Korean won (₩)"}</b>
        {updated && <span className="fx-time">{(t.updated || "Updated")}: {updated.replace(" +0000", " UTC")}</span>}
      </div>

      {err ? (
        <p className="fx-err">{t.error || "Couldn't load live rates right now — check a currency app or your bank for the current rate."}</p>
      ) : !rates ? (
        <p className="fx-loading">{t.loading || "Loading live rates…"}</p>
      ) : (
        <div className="fx-grid">
          {CURRENCIES.filter((c) => rates[c.code]).map((c) => {
            const krw = c.unit / rates[c.code]; // rates[code] = value of 1 KRW in that currency
            return (
              <div className="fx-cell" key={c.code}>
                <span className="fx-from">{c.flag} {c.unit === 1 ? "1" : c.unit.toLocaleString("en-US")} {c.code}</span>
                <span className="fx-eq">≈ <b>{fmt(krw)}</b> ₩</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="fx-note">
        {t.note || "Indicative mid-market rate for reference only. Exchange booths, ATMs and card networks apply their own (usually less favourable) rates and fees."}
        {" "}
        {t.source || "Source"}: <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">open.er-api.com</a>
      </p>
    </div>
  );
}
