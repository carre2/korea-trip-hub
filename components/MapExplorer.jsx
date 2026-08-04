"use client";

import { useEffect, useRef, useState } from "react";
import { NAVER_MAP_CLIENT_ID, KAKAO_JS_KEY } from "../lib/config";

// Seoul city hall — default map center.
const SEOUL = { lat: 37.5665, lng: 126.978 };
const DEFAULT_QUERY = "Myeongdong, Seoul";

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script load failed: " + src));
    document.head.appendChild(s);
  });
}

export default function MapExplorer({ labels }) {
  const t = labels || {};
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  // Default to Google Maps — it labels places in English, which is what most visitors want.
  const [provider, setProvider] = useState("google");
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [committed, setCommitted] = useState(DEFAULT_QUERY); // drives the Google iframe
  const [note, setNote] = useState("");

  // Initialize / switch the Naver/Kakao map SDK (Google uses a keyless iframe below).
  useEffect(() => {
    let cancelled = false;
    setNote("");
    if (provider === "naver") {
      if (!NAVER_MAP_CLIENT_ID) { setNote(t.naverMissing || "Naver map key not set."); return; }
      window.navermap_authFailure = () =>
        setNote(t.authFail || "Naver Maps auth failed — check the Client ID and that this domain is registered.");
      const url = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
      loadScript(url, "naver-maps-sdk")
        .then(() => {
          if (cancelled || !window.naver || !boxRef.current) return;
          const naver = window.naver;
          mapRef.current = new naver.maps.Map(boxRef.current, {
            center: new naver.maps.LatLng(SEOUL.lat, SEOUL.lng),
            zoom: 12,
          });
        })
        .catch(() => setNote(t.loadFail || "Failed to load Naver Maps."));
    } else if (provider === "kakao") {
      if (!KAKAO_JS_KEY) { setNote(t.kakaoPending || "KakaoMap key not set yet — coming soon."); mapRef.current = null; return; }
      const url = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false&libraries=services`;
      loadScript(url, "kakao-maps-sdk")
        .then(() => {
          if (cancelled || !window.kakao || !boxRef.current) return;
          window.kakao.maps.load(() => {
            mapRef.current = new window.kakao.maps.Map(boxRef.current, {
              center: new window.kakao.maps.LatLng(SEOUL.lat, SEOUL.lng),
              level: 8,
            });
          });
        })
        .catch(() => setNote(t.loadFail || "Failed to load KakaoMap."));
    }
    return () => { cancelled = true; };
  }, [provider]); // eslint-disable-line react-hooks/exhaustive-deps

  function search() {
    if (!query.trim()) return;
    if (provider === "google") {
      setCommitted(query.trim());
      return;
    }
    if (provider === "naver" && window.naver?.maps?.Service) {
      window.naver.maps.Service.geocode({ query }, (status, res) => {
        const ok = window.naver.maps.Service.Status.OK;
        if (status !== ok || !res.v2.addresses.length) { setNote(t.noResult || "No result — try an address."); return; }
        const a = res.v2.addresses[0];
        const ll = new window.naver.maps.LatLng(+a.y, +a.x);
        mapRef.current.setCenter(ll);
        mapRef.current.setZoom(16);
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.naver.maps.Marker({ position: ll, map: mapRef.current });
        setNote(a.roadAddress || a.jibunAddress || "");
      });
    } else if (provider === "kakao" && window.kakao?.maps?.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(query, (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !result.length) { setNote(t.noResult || "No result."); return; }
        const ll = new window.kakao.maps.LatLng(result[0].y, result[0].x);
        mapRef.current.setCenter(ll);
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.kakao.maps.Marker({ position: ll, map: mapRef.current });
        setNote(result[0].address_name || "");
      });
    } else {
      setNote(t.kakaoPending || "This map is not available yet.");
    }
  }

  const btn = (id, label) => (
    <button className={id} aria-selected={provider === id} onClick={() => setProvider(id)}>{label}</button>
  );

  return (
    <div className="mapbox">
      <div className="mapsearch">
        <div className="maptoggle" role="tablist" style={{ marginRight: 6 }}>
          {btn("google", "🌐 Google")}
          {btn("naver", "🟢 Naver")}
          {btn("kakao", "🟡 Kakao")}
        </div>
        <div className="inp" style={{ flex: 1 }}>
          <span className="i">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={t.placeholder || "Search a place or address…"}
            aria-label="Search map"
          />
        </div>
        <button className="btn" onClick={search}>{t.search || "Search"}</button>
      </div>

      {provider === "google" ? (
        <iframe
          title="Google Map"
          src={`https://www.google.com/maps?q=${encodeURIComponent(committed || "Seoul")}&hl=en&z=14&output=embed`}
          style={{ height: 360, width: "100%", border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div ref={boxRef} style={{ height: 360, width: "100%", background: "var(--surface-2)" }} />
      )}

      <div className="mapnote">
        {provider === "google"
          ? (t.mapNoteGoogle || "Google Maps shows place names in English. For in-Korea navigation (directions), Naver or KakaoMap work best.")
          : (t.mapNoteKorean || "Naver / KakaoMap give the best in-Korea detail and directions, but label places in Korean. Switch to Google for English labels.")}
      </div>
      {note && (
        <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {note}
        </div>
      )}
    </div>
  );
}
