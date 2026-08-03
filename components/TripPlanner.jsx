"use client";

import { useState } from "react";
import citiesData from "../data/cities.json";
import factsData from "../data/facts.json";

const CITY_ORDER = citiesData.order;
const CITIES = citiesData.cities;
const FACTS = Object.fromEntries((factsData.facts || []).map((f) => [f.id, f]));

const STYLE_CHIPS = [
  { key: "food", label: "🍜 Food" },
  { key: "kpop", label: "🎤 K-pop" },
  { key: "sights", label: "🏛️ Sights" },
  { key: "hiking", label: "🥾 Hiking" },
  { key: "shopping", label: "🛍️ Shopping" },
];
const SLOTS = ["morning", "afternoon", "evening"];

// Build a day-by-day plan. NAMES are editorial (real places); no invented numbers.
function generate(cityKey, days, styles) {
  const city = CITIES[cityKey];
  if (!city) return null;
  const daysOut = [];
  const areas = city.areas;
  for (let d = 0; d < days; d++) {
    const area = areas[d % areas.length];
    let spots = area.spots;
    if (styles.size) {
      const filtered = spots.filter((s) => styles.has(s.c));
      if (filtered.length) spots = filtered;
    }
    spots = spots.slice(0, 3);
    daysOut.push({ area: area.area, spots });
  }
  return { city, daysOut };
}

export default function TripPlanner({ hero = {}, t = {} }) {
  const [hotel, setHotel] = useState("");
  const [dest, setDest] = useState("busan");
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState("2 people");
  const [styles, setStyles] = useState(new Set(["sights", "food"]));
  const [plan, setPlan] = useState(null);

  function toggleStyle(k) {
    setStyles((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  }
  function build() {
    setPlan(generate(dest, days, styles));
  }

  const transport = plan && plan.city.transportFromSeoul;
  const transportFact = transport && transport.factId ? FACTS[transport.factId] : null;
  const factOk = transportFact && transportFact.status === "VERIFIED";

  return (
    <>
      <div className="planner reveal">
        <div className="planner-top">
          <span className="tag">● Plan a trip</span>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Free · No sign-up · No AI cost</span>
        </div>

        <div className="route">
          <div className="field">
            <label><span className="dot" style={{ background: "var(--primary)" }} /> {hero.f_hotel}</label>
            <div className="inp"><span className="i">🏨</span>
              <input value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder="Lotte Hotel, Myeongdong (Seoul)" aria-label="Starting hotel" />
            </div>
          </div>
          <div className="field">
            <label><span className="dot" style={{ background: "var(--accent)" }} /> {hero.f_dest}</label>
            <div className="inp"><span className="i">📍</span>
              <select value={dest} onChange={(e) => setDest(e.target.value)} aria-label="Destination">
                {CITY_ORDER.map((k) => <option key={k} value={k}>{CITIES[k].name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="planner-row2">
          <div className="field">
            <label>{hero.f_days}</label>
            <div className="inp"><span className="i">🗓️</span>
              <select value={days} onChange={(e) => setDays(+e.target.value)} aria-label="Days">
                {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} days</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>{hero.f_travelers}</label>
            <div className="inp"><span className="i">👥</span>
              <select value={travelers} onChange={(e) => setTravelers(e.target.value)} aria-label="Travelers">
                <option>Solo</option><option>2 people</option><option>Family</option><option>Group</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>{hero.f_style}</label>
            <div className="chips">
              {STYLE_CHIPS.map((c) => (
                <button key={c.key} type="button" className="chip"
                  aria-pressed={styles.has(c.key)} onClick={() => toggleStyle(c.key)}>{c.label}</button>
              ))}
            </div>
          </div>
          <button className="btn go" onClick={build}>✨ {hero.build}</button>
        </div>
      </div>

      {plan && (
        <div className="itin" style={{ marginTop: 22 }}>
          <div className="itin-head">
            <div className="route-lbl">
              🏨 {hotel || "Your hotel"} <span className="arrow">→</span> {plan.city.name}
            </div>
            <span className="pill" style={{ background: "var(--jade-soft)", color: "var(--jade)" }}>
              {days} days · {travelers}
            </span>
          </div>

          <div style={{ padding: "8px 0" }}>
            {plan.daysOut.map((day, i) => (
              <div className="day" key={i} style={{ borderTop: i ? "1px solid var(--border)" : "none" }}>
                <h4>{t.day || "Day"} {i + 1} · {day.area}</h4>

                {i === 0 && transport && (
                  <div className="transport">
                    <span className="ic">{dest === "jeju" ? "✈️" : "🚄"}</span>
                    <div className="txt">
                      <b>{t.gettingThere || "Getting there"}: {transport.mode}</b>
                      <div>
                        {factOk
                          ? `${transportFact.value.duration} · ${transportFact.value.fare_krw_standard} KRW · `
                          : ""}
                        {transport.note || ""}{" "}
                        {factOk && (
                          <a href={transportFact.source} target="_blank" rel="noopener noreferrer">
                            {transportFact.source_name}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {day.spots.map((s, j) => (
                  <div className="step" key={j}>
                    <div className="t">{t[SLOTS[j]] || SLOTS[j]}</div>
                    <div className="body"><b>{s.n}</b>{s.d && <div className="meta">{s.d}</div>}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="share">
            <span className="lbl">{t.share || "Share this trip"}</span>
            <button className="sbtn" title="KakaoTalk" style={{ background: "#FEE500", color: "#3A1D1D" }}>K</button>
            <button className="sbtn" title="WhatsApp" style={{ color: "#25D366" }}>✆</button>
            <button className="sbtn" title="LINE" style={{ color: "#06C755" }}>L</button>
            <button className="sbtn" title="X">𝕏</button>
            <button className="sbtn" title="Copy link" onClick={() => navigator.clipboard?.writeText(window.location.href)}>🔗</button>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
              ⓘ {t.transportNote || "Times and fares change — confirm with the operator."}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
