"use client";

// "Find this food near me" — opens Google / Naver / KakaoMap searching for the
// dish around the visitor's current location. Naver & Kakao don't expose ratings
// via API, so we open their apps where the user can see & sort by rating (4★+).
import { useState } from "react";

export default function NearbyEats({ q, label }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);

  function requestGeo() {
    if (coords || typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  }
  function toggle() {
    if (!open) requestGeo();
    setOpen((o) => !o);
  }
  function openMap(which) {
    const query = encodeURIComponent(q);
    let url;
    if (which === "google") {
      url = coords
        ? `https://www.google.com/maps/search/${query}/@${coords.lat},${coords.lng},16z`
        : `https://www.google.com/maps/search/?api=1&query=${query}`;
    } else if (which === "naver") {
      url = `https://map.naver.com/p/search/${query}`;
    } else {
      url = `https://map.kakao.com/?q=${query}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="nearby">
      <button type="button" className="nearby-btn" onClick={toggle} aria-expanded={open} title={label}>
        📍 Find near me
      </button>
      {open && (
        <div className="nearby-menu" role="menu">
          <button type="button" onClick={() => openMap("google")}>🌐 Google</button>
          <button type="button" onClick={() => openMap("naver")}>🟢 Naver</button>
          <button type="button" onClick={() => openMap("kakao")}>🟡 Kakao</button>
          <span className="nearby-hint">Sort by 4★+ in the app</span>
        </div>
      )}
    </div>
  );
}
