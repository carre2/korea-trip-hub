"use client";

import { useEffect, useRef, useState } from "react";
import { NAVER_MAP_CLIENT_ID, KAKAO_JS_KEY } from "../lib/config";

// Seoul city hall — default map center.
const SEOUL = { lat: 37.5665, lng: 126.978 };

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
  const [provider, setProvider] = useState("naver");
  const [query, setQuery] = useState("명동");
  const [note, setNote] = useState("");

  // Initialize / switch the active map provider.
  useEffect(() => {
    let cancelled = false;
    setNote("");

    if (provider === "naver") {
      if (!NAVER_MAP_CLIENT_ID) { setNote(t.naverMissing || "Naver map key not set."); return; }
      // Surface auth/domain errors from Naver.
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

  return (
    <div className="mapbox">
      <div className="mapsearch">
        <div className="maptoggle" role="tablist" style={{ marginRight: 6 }}>
          <button
            className="naver"
            aria-selected={provider === "naver"}
            onClick={() => setProvider("naver")}
          >🟢 Naver</button>
          <button
            className="kakao"
            aria-selected={provider === "kakao"}
            onClick={() => setProvider("kakao")}
          >🟡 Kakao</button>
        </div>
        <div className="inp" style={{ flex: 1 }}>
          <span className="i">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={t.placeholder || "Search an address or place…"}
            aria-label="Search map"
          />
        </div>
        <button className="btn" onClick={search}>{t.search || "Search"}</button>
      </div>
      <div ref={boxRef} style={{ height: 360, width: "100%", background: "var(--surface-2)" }} />
      {note && (
        <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {note}
        </div>
      )}
    </div>
  );
}
