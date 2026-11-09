"use client";
// "Map" tab of the place-report entry: Korea -> click a region -> its 시군구 appear
// where their attractions actually are (/api/place/regionmap) -> pick a category
// (optionally a 시군구 first) -> pins + cards (/api/place/browse) -> a card or pin
// opens the report for that exact place.
import { useEffect, useRef, useState } from "react";
import LDONG from "../worker/ldong.json";
import { loadLeaflet, OSM_TILES } from "../lib/leaflet";
import { BROWSE_CATS, BROWSE_WHENS, fetchBrowse, reportHref, ResultCards } from "./PlaceBrowseCards";

// Approximate visual centre of each 시도 (map placement only, never shown as data).
// Spread slightly so the capital-area and Chungcheong labels don't overlap.
const REGION_CENTER = {
  11: [37.5665, 126.99], 28: [37.42, 126.55], 41: [37.98, 127.25], 51: [37.75, 128.35],
  43: [36.92, 127.85], 44: [36.45, 126.65], 36110: [36.62, 127.08], 30: [36.3, 127.45],
  47: [36.45, 128.85], 27: [35.8714, 128.6014], 52: [35.72, 127.1], 12: [34.9, 126.85],
  48: [35.28, 128.15], 31: [35.56, 129.35], 26: [35.13, 129.05], 50: [33.38, 126.55],
};
// Short labels for the country view; full names are used once a region is open.
const REGION_SHORT = {
  ko: { 11: "서울", 28: "인천", 41: "경기", 51: "강원", 43: "충북", 44: "충남", 36110: "세종", 30: "대전", 47: "경북", 27: "대구", 52: "전북", 12: "광주·전남", 48: "경남", 31: "울산", 26: "부산", 50: "제주" },
  en: { 11: "Seoul", 28: "Incheon", 41: "Gyeonggi", 51: "Gangwon", 43: "Chungbuk", 44: "Chungnam", 36110: "Sejong", 30: "Daejeon", 47: "Gyeongbuk", 27: "Daegu", 52: "Jeonbuk", 12: "Gwangju·Jeonnam", 48: "Gyeongnam", 31: "Ulsan", 26: "Busan", 50: "Jeju" },
};
const KOREA_VIEW = [[33.1, 125.9], [38.6, 129.6]];
const PIN = { sights: "#1f6feb", festival: "#d6336c", food: "#c2410c", stay: "#0f9d7a", shopping: "#b7791f", course: "#7048e8" };

function esc(s) {
  return String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

export default function PlaceMapExplore({ locale, t, badge }) {
  const nameOf = (x) => (locale === "ko" ? x.ko : x.en || x.ko);
  const el = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [region, setRegion] = useState(null); // { code, ko, en }
  const [sgList, setSgList] = useState([]);
  const [sigungu, setSigungu] = useState(null);
  const [cat, setCat] = useState("");
  const [when, setWhen] = useState("upcoming");
  const [list, setList] = useState(null);
  const [status, setStatus] = useState("idle");

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !L || !el.current || mapRef.current) return;
      const m = L.map(el.current, { scrollWheelZoom: false, minZoom: 6 });
      m.fitBounds(KOREA_VIEW);
      L.tileLayer(OSM_TILES, { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(m);
      layerRef.current = L.layerGroup().addTo(m);
      mapRef.current = m;
      setReady(true);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  const load = async ({ c = cat, sg = sigungu, w = when, page = 1 } = {}) => {
    if (!region || !c) return;
    setStatus("loading");
    const data = await fetchBrowse({ locale, region: region.code, sigungu: sg && sg.code, cat: c, when: w, page });
    if (!data.ok) { setStatus("failed"); return; }
    setList((prev) => ({ items: page > 1 && prev ? [...prev.items, ...data.items] : data.items, page: data.page, more: data.more }));
    setStatus("ok");
  };

  const pickRegion = async (r) => {
    setRegion(r); setSigungu(null); setSgList([]); setList(null); setStatus("idle");
    try {
      const res = await fetch(`/api/place/regionmap?region=${encodeURIComponent(r.code)}`);
      const data = await res.json().catch(() => ({ ok: false }));
      if (data.ok) setSgList(data.sigungu);
    } catch { /* bubbles just won't show; categories still work */ }
  };
  const pickSigungu = (s) => {
    setSigungu(s); setList(null); setStatus("idle");
    if (cat) load({ sg: s });
  };
  const pickCat = (c) => { setCat(c); setList(null); load({ c }); };
  const toCountry = () => { setRegion(null); setSigungu(null); setSgList([]); setCat(""); setList(null); setStatus("idle"); };

  // Redraw markers for the current level.
  useEffect(() => {
    if (!ready) return;
    const L = window.L, m = mapRef.current, g = layerRef.current;
    if (!L || !m || !g) return;
    g.clearLayers();
    const bubble = (lat, lng, label, active, onClick) => {
      const icon = L.divIcon({ className: "pmap-pin", html: `<span class="pmap-bubble${active ? " on" : ""}">${esc(label)}</span>`, iconSize: null });
      L.marker([lat, lng], { icon, keyboard: true, title: label }).on("click", onClick).addTo(g);
    };
    if (list && list.items.length) {
      const pts = [];
      for (const it of list.items) {
        if (!Number.isFinite(it.lat) || !Number.isFinite(it.lng)) continue;
        pts.push([it.lat, it.lng]);
        L.circleMarker([it.lat, it.lng], { radius: 8, color: "#fff", weight: 2, fillColor: PIN[cat] || "#333", fillOpacity: 0.95 })
          .bindPopup(`<a href="${esc(reportHref(locale, it))}"><b>${esc(it.title)}</b></a>`)
          .addTo(g);
      }
      if (pts.length) m.fitBounds(pts, { padding: [30, 30], maxZoom: 14 });
      return;
    }
    if (region) {
      const pts = sgList.map((s) => [s.lat, s.lng]);
      sgList.forEach((s) => bubble(s.lat, s.lng, nameOf(s), sigungu && String(sigungu.code) === String(s.code), () => pickSigungu(s)));
      if (sigungu) {
        const s = sgList.find((x) => String(x.code) === String(sigungu.code));
        if (s) m.setView([s.lat, s.lng], Math.max(m.getZoom(), 10));
      } else if (pts.length) {
        m.fitBounds(pts, { padding: [40, 40], maxZoom: 11 });
      } else if (REGION_CENTER[region.code]) {
        m.setView(REGION_CENTER[region.code], 9);
      }
      return;
    }
    LDONG.regions.forEach((r) => {
      const c = REGION_CENTER[r.code];
      const short = REGION_SHORT[locale === "ko" ? "ko" : "en"][r.code];
      if (c) bubble(c[0], c[1], short || nameOf(r), false, () => pickRegion(r));
    });
    m.fitBounds(KOREA_VIEW);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, region, sgList, sigungu, list, cat, locale]);

  return (
    <div className="prs-browse pmap">
      <nav className="pmap-crumbs" aria-label={t.region}>
        <button type="button" className={region ? "" : "on"} onClick={toCountry}>{t.country}</button>
        {region && <><span aria-hidden="true">›</span><button type="button" className={sigungu ? "" : "on"} onClick={() => { setSigungu(null); setList(null); setStatus("idle"); if (cat) load({ sg: null }); }}>{nameOf(region)}</button></>}
        {sigungu && <><span aria-hidden="true">›</span><button type="button" className="on">{nameOf(sigungu)}</button></>}
      </nav>
      <div className="pmap-map" ref={el} />
      <p className="pmap-hint">{region ? t.mapHintRegion : t.mapHint}</p>
      {region && (
        <div className="pmap-cats">
          {BROWSE_CATS.map((c) => (
            <button key={c} type="button" className={`prs-chip${cat === c ? " on" : ""}`} aria-pressed={cat === c} onClick={() => pickCat(c)}>{t.cats[c]}</button>
          ))}
          {cat === "festival" && (
            <select className="pmap-when" aria-label={t.when} value={when} onChange={(e) => { setWhen(e.target.value); load({ w: e.target.value }); }}>
              {BROWSE_WHENS.map((w) => <option key={w} value={w}>{t.whens[w]}</option>)}
            </select>
          )}
        </div>
      )}
      <ResultCards locale={locale} list={list} status={status} t={t} badge={badge} onMore={() => load({ page: (list?.page || 1) + 1 })} />
    </div>
  );
}
