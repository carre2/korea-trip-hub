"use client";

// Live current weather for Seoul, Busan and Jeju.
// Client-side fetch from Open-Meteo (free, no key, CORS-enabled). Shows the
// current temperature + condition and today's high/low. HARNESS: real fetched
// data, labelled with its source.
import { useEffect, useState } from "react";

const CITIES = [
  { key: "seoul", name: "Seoul", lat: 37.57, lng: 126.98 },
  { key: "busan", name: "Busan", lat: 35.18, lng: 129.08 },
  { key: "jeju", name: "Jeju", lat: 33.51, lng: 126.52 },
];

// WMO weather codes → emoji + short label.
function wmo(code) {
  if (code === 0) return { e: "☀️", t: "Clear" };
  if (code === 1) return { e: "🌤️", t: "Mainly clear" };
  if (code === 2) return { e: "⛅", t: "Partly cloudy" };
  if (code === 3) return { e: "☁️", t: "Overcast" };
  if (code === 45 || code === 48) return { e: "🌫️", t: "Fog" };
  if (code >= 51 && code <= 57) return { e: "🌦️", t: "Drizzle" };
  if (code >= 61 && code <= 67) return { e: "🌧️", t: "Rain" };
  if (code >= 71 && code <= 77) return { e: "🌨️", t: "Snow" };
  if (code >= 80 && code <= 82) return { e: "🌧️", t: "Showers" };
  if (code === 85 || code === 86) return { e: "🌨️", t: "Snow showers" };
  if (code >= 95) return { e: "⛈️", t: "Thunderstorm" };
  return { e: "🌡️", t: "" };
}

export default function WeatherNow({ labels }) {
  const t = labels || {};
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      CITIES.map((c) =>
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=Asia%2FSeoul`)
          .then((r) => r.json())
          .then((d) => ({
            key: c.key,
            name: c.name,
            temp: d?.current?.temperature_2m,
            code: d?.current?.weather_code,
            hi: d?.daily?.temperature_2m_max?.[0],
            lo: d?.daily?.temperature_2m_min?.[0],
          }))
      )
    )
      .then((rows) => { if (!cancelled) setData(rows); })
      .catch(() => { if (!cancelled) setErr(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="wx">
      <div className="wx-head"><b>{t.title || "Weather right now"}</b></div>
      {err ? (
        <p className="wx-msg">{t.error || "Couldn't load live weather — check a forecast app for the current conditions."}</p>
      ) : !data ? (
        <p className="wx-msg">{t.loading || "Loading live weather…"}</p>
      ) : (
        <div className="wx-grid">
          {data.map((c) => {
            const w = wmo(c.code);
            const cityName = (t.cities && t.cities[c.key]) || c.name;
            return (
              <div className="wx-cell" key={c.key}>
                <div className="wx-city">{cityName}</div>
                <div className="wx-temp"><span className="wx-emoji">{w.e}</span>{c.temp != null ? Math.round(c.temp) : "–"}°</div>
                <div className="wx-hl">↑{c.hi != null ? Math.round(c.hi) : "–"}° ↓{c.lo != null ? Math.round(c.lo) : "–"}°</div>
              </div>
            );
          })}
        </div>
      )}
      <p className="wx-note">
        {t.note || "Live conditions for reference."} {t.source || "Source"}:{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a>
      </p>
    </div>
  );
}
