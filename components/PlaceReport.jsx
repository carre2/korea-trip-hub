"use client";
// Place Report renderer. Static export can't pre-render per place, so this client
// component reads ?q=/areaCode= from the URL, calls the Worker (/api/place/report),
// and renders an institutional-style report: cover, sticky TOC, sections, map,
// affiliate blocks (Klook tours, Stay22 stays), sources. Leaflet loads from CDN.
// Fact policy: everything shown comes from TourAPI with a source + confidence badge;
// nothing is invented client-side.
import { useEffect, useRef, useState, useCallback } from "react";
import copyAll from "../data/place-report-ui.json";
import { klookSearch, stay22Embed, DISCLOSURE } from "../lib/booking";
import { track } from "../lib/analytics";
import { loadLeaflet, OSM_TILES } from "../lib/leaflet";
import { shareToKakao, preloadKakao } from "../lib/kakao-share";

const COLORS = { sights: "#1f6feb", food: "#c2410c", lodging: "#0f9d7a", shopping: "#b7791f" };
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Leaflet popups take HTML strings — escape anything that isn't ours.
const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function readParams() {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    q: (sp.get("q") || "").trim(),
    // Display name in the page language when the query is a Korean name (example chips).
    label: (sp.get("label") || "").trim().slice(0, 80),
    contentId: sp.get("contentId") || "",
    cl: sp.get("cl") || "",
    areaCode: sp.get("areaCode") || "",
    sigunguCode: sp.get("sigunguCode") || "",
  };
}

export default function PlaceReport({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  const [status, setStatus] = useState("loading"); // loading | ok | notfound | failed | empty
  const [rep, setRep] = useState(null);
  const [active, setActive] = useState("s1");
  // Hidden while the visitor explores with the map / step-by-step tabs above.
  const [exploring, setExploring] = useState(false);
  useEffect(() => {
    const on = (e) => setExploring(!!e.detail && e.detail.tab !== "search");
    window.addEventListener("prs:tab", on);
    return () => window.removeEventListener("prs:tab", on);
  }, []);
  const mapRef = useRef(null);
  const mapObj = useRef(null);

  const fetchReport = useCallback(async (override) => {
    const p = { ...readParams(), ...(override || {}) };
    if (!p.q && !p.areaCode) { setStatus("empty"); return; }
    setStatus("loading");
    const api = new URLSearchParams({ locale });
    if (p.q) api.set("q", p.q);
    if (p.contentId) api.set("contentId", p.contentId);
    if (p.contentId && p.cl) api.set("cl", p.cl);
    if (p.areaCode) api.set("areaCode", p.areaCode);
    if (p.sigunguCode) api.set("sigunguCode", p.sigunguCode);
    try {
      const res = await fetch(`/api/place/report?${api.toString()}`);
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) { setStatus(data && data.error === "not_found" ? "notfound" : "failed"); return; }
      setRep(p.label ? { ...data, place: { ...data.place, title: p.label } } : data);
      setStatus("ok");
      track("place_report_view", { locale, mode: data.place?.mode, q: p.q || "" });
      preloadKakao(); // so the share click can open Kakao's window without a popup block
    } catch {
      setStatus("failed");
    }
  }, [locale]);

  useEffect(() => { fetchReport(); /* eslint-disable-next-line */ }, []);

  // Build the Leaflet map once a report is loaded.
  useEffect(() => {
    if (status !== "ok" || !rep || !rep.place?.coords || !mapRef.current) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !L || !mapRef.current) return;
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
      const { lat, lng } = rep.place.coords;
      const zoom = rep.place.mode === "area" ? 10 : 15;
      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([lat, lng], zoom);
      mapObj.current = map;
      L.tileLayer(OSM_TILES, { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
      L.circleMarker([lat, lng], { radius: 8, color: "#111", fillColor: "#111", fillOpacity: 1 }).addTo(map).bindPopup(`${esc(rep.place.title)} ${esc(t.legend.center)}`);
      for (const cat of ["sights", "food", "lodging", "shopping"]) {
        for (const it of rep.sections[cat] || []) {
          if (!isFinite(it.lat) || !isFinite(it.lng)) continue;
          L.circleMarker([it.lat, it.lng], { radius: 6, color: "#fff", weight: 1.5, fillColor: COLORS[cat], fillOpacity: 0.95 }).addTo(map).bindPopup(esc(it.title));
        }
      }
    });
    return () => { cancelled = true; if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, [status, rep, t, exploring]);

  // Active-section highlight for the sticky TOC.
  useEffect(() => {
    if (status !== "ok") return;
    const secs = Array.from(document.querySelectorAll(".prr-main section[id]"));
    if (!secs.length) return;
    const ob = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-20% 0px -70% 0px" });
    secs.forEach((s) => ob.observe(s));
    return () => ob.disconnect();
  }, [status, exploring]);

  if (status === "empty" || exploring) return null;
  if (status === "loading") return <div className="prr-state"><span className="prr-spin" aria-hidden="true" /> {t.state.loading}</div>;
  if (status === "notfound" || status === "failed") {
    return (
      <div className="prr-state">
        <p>{status === "notfound" ? t.state.notFound : t.state.failed}</p>
        <button className="btn" onClick={() => fetchReport()}>{t.state.retry}</button>
      </div>
    );
  }

  const place = rep.place;
  const mapsQ = encodeURIComponent(`${place.title} ${place.region || ""}`.trim());
  const coverStyle = place.hero
    ? { backgroundImage: `linear-gradient(135deg,rgba(11,61,145,.80),rgba(31,111,235,.66)),url('${place.hero}')` }
    : undefined;

  return (
    <div className="prr">
      <header className={`prr-cover${place.hero ? " has-hero" : ""}`} style={coverStyle}>
        <div className="wrap">
          <div className="prr-eyebrow">ktriphub · {t.sec.overview}</div>
          <h1 className="prr-title">{place.title}</h1>
          {place.region && <div className="prr-region">📍 {place.region}</div>}
          <div className="prr-legend">
            <span className="prr-badge ok">✓ {t.badge.verified}</span>
            <span className="prr-badge ref">⚠ {t.badge.reference}</span>
          </div>
        </div>
      </header>

      <div className="wrap prr-layout">
        <nav className="prr-toc" aria-label={t.sec.overview}>
          {[["s1", t.sec.overview], ["s2", t.sec.map], ["s4", t.sec.sights], ["s5", t.sec.foodshop], ["s6", t.sec.tours], ["s7", t.sec.stay], ["s9", t.sec.sources]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>{label}</a>
          ))}
        </nav>

        <main className="prr-main">
          <Section id="s1" n="1" title={t.sec.overview}>
            {place.overview && <div className="prr-overview">{place.overview}</div>}
            <div className="prr-counts">
              <b>{t.ui.within}:</b> {t.legend.sights} {rep.counts.sights} · {t.legend.food} {rep.counts.food} · {t.legend.shopping} {rep.counts.shopping} · {t.legend.stay} {rep.counts.lodging}
              <span className="prr-badge ok">✓ TourAPI</span>
            </div>
            {rep.drilldown?.length > 0 && (
              <div className="prr-drill">
                <span className="prr-drill-label">{t.ui.drill}</span>
                {rep.drilldown.map((d) => (
                  <button key={d.code} className="prr-chip" onClick={() => fetchReport({ sigunguCode: d.code })}>{d.name}</button>
                ))}
              </div>
            )}
          </Section>

          <Section id="s2" n="2" title={t.sec.map}>
            <div className="prr-map" ref={mapRef} />
            <div className="prr-maplinks">
              <a className="btn sm" href={`https://www.google.com/maps/search/?api=1&query=${mapsQ}`} target="_blank" rel="noopener noreferrer">Google Maps ↗</a>
              <a className="btn sm" href={`https://map.naver.com/v5/search/${mapsQ}`} target="_blank" rel="noopener noreferrer">Naver Map ↗</a>
            </div>
            <p className="prr-maplegend">
              <b style={{ color: COLORS.sights }}>●</b> {t.legend.sights} <b style={{ color: COLORS.food }}>●</b> {t.legend.food} <b style={{ color: COLORS.lodging }}>●</b> {t.legend.stay} <b style={{ color: COLORS.shopping }}>●</b> {t.legend.shopping}
            </p>
          </Section>

          <Section id="s4" n="4" title={t.sec.sights}>
            <Cards items={rep.sections.sights} t={t} />
          </Section>

          <Section id="s5" n="5" title={t.sec.foodshop}>
            <h4 className="prr-subh">🍽️ {t.sec.food}</h4>
            <Cards items={rep.sections.food} t={t} />
            <h4 className="prr-subh">🛍️ {t.sec.shopping}</h4>
            <Cards items={rep.sections.shopping} t={t} />
          </Section>

          <Section id="s6" n="6" title={t.sec.tours}>
            <div className="prr-aff">
              <div className="prr-aff-head"><span className="prr-tag klook">Klook</span><span>{t.ui.tourNote}</span></div>
              <a className="btn" href={klookSearch(place.title)} target="_blank" rel="noopener noreferrer" onClick={() => track("affiliate_click", { partner: "klook", context: "place_report", q: place.title })}>
                {t.sec.tours} — {place.title} ↗
              </a>
            </div>
          </Section>

          <Section id="s7" n="7" title={t.sec.stay}>
            <h4 className="prr-subh">🏨 {t.ui.nearbyStays}</h4>
            <Cards items={rep.sections.lodging} t={t} />
            {stay22Embed(place.title) && (
              <div className="prr-aff" style={{ marginTop: 14 }}>
                <div className="prr-aff-head"><span className="prr-tag stay">Stay22</span><span>Booking · Expedia · Airbnb · Agoda</span></div>
                <iframe
                  className="prr-stay22"
                  src={stay22Embed(place.title)}
                  title="Stay22"
                  loading="lazy"
                  onLoad={() => track("affiliate_click", { partner: "stay22", context: "place_report_embed", q: place.title })}
                />
              </div>
            )}
          </Section>

          <Section id="s9" n="9" title={t.sec.sources}>
            <ul className="prr-srclist">
              <li><span className="prr-badge ok">✓</span> {t.ui.poweredBy} <span className="prr-when">{t.ui.collected} {rep.source?.collectedAt}</span></li>
              <li><span className="prr-badge ref">⚠</span> {t.ui.tourNote} — Klook / Stay22</li>
            </ul>
            <p className="prr-disclaimer">🛈 {t.ui.disclaimer}</p>
            <p className="prr-disclaimer" style={{ fontSize: ".74rem" }}>{DISCLOSURE}</p>
          </Section>

          <div className="prr-cta">
            <h2>{t.cta.title}</h2>
            <p>{t.cta.sub}</p>
            <div className="prr-cta-row">
              <EmailCTA locale={locale} t={t} />
              <button className="btn prr-kakao" onClick={() => shareKakao(rep, t)}>💬 {t.cta.kakao}</button>
              <button className="btn" onClick={() => shareReport(place.title)}>↗ {t.cta.sns}</button>
              <button className="btn" onClick={() => window.print()}>📄 {t.cta.pdf}</button>
              <button className="btn" onClick={() => saveReport(place.title)}>🔖 {t.cta.save}</button>
            </div>
          </div>
          <p className="prr-locnote">{t.ui.localize}</p>
        </main>
      </div>
    </div>
  );
}

function Section({ id, n, title, children }) {
  return (
    <section id={id} className="prr-section">
      <div className="prr-sechead"><span className="prr-secno">{n}</span><h2>{title}</h2></div>
      {children}
    </section>
  );
}

function Cards({ items, t }) {
  if (!items || !items.length) return <p className="prr-empty">{t.state.notFound}</p>;
  return (
    <div className="prr-grid">
      {items.map((it) => (
        <article className="prr-card" key={it.id}>
          <div className={`prr-thumb${it.image ? "" : " ph"}`}>
            {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span>📷</span>}
          </div>
          <div className="prr-cbody">
            <h3>{it.title}</h3>
            <p className="prr-addr">📍 {it.addr}{it.dist != null ? ` · ${it.dist}m` : ""}</p>
            <p className="prr-meta"><span className="prr-badge ok">✓ {t.badge.verified}</span> {it.lang === "ko" && <span className="prr-badge ref">🇰🇷 {t.badge.koListing}</span>} <span className="prr-src">{t.badge.source}: TourAPI</span></p>
          </div>
        </article>
      ))}
    </div>
  );
}

// KakaoTalk card: place name, region + what's nearby, the hero photo, a link back here.
function shareKakao(rep, t) {
  const p = rep.place;
  const c = rep.counts || {};
  const description = [
    p.region ? `📍 ${p.region}` : "",
    `${t.legend.sights} ${c.sights || 0} · ${t.legend.food} ${c.food || 0} · ${t.legend.stay} ${c.lodging || 0}`,
  ].filter(Boolean).join("\n");
  const url = window.location.href;
  track("share_click", { channel: "kakao", context: "place_report" });
  const ok = shareToKakao({ title: `${p.title} — ktriphub`, description, imageUrl: p.hero, url, buttonTitle: "ktriphub" });
  if (!ok) shareReport(p.title); // SDK blocked/unavailable: native share sheet or copy link
}

function shareReport(title) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  if (navigator.share) { navigator.share({ title: `${title} — ktriphub`, url }).catch(() => {}); }
  else if (navigator.clipboard) { navigator.clipboard.writeText(url).catch(() => {}); }
}

function saveReport(title) {
  try {
    const url = window.location.href;
    const key = "kth_saved_reports";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    if (!list.some((r) => r.url === url)) { list.unshift({ title, url, at: Date.now() }); localStorage.setItem(key, JSON.stringify(list.slice(0, 50))); }
  } catch { /* ignore storage errors */ }
}

// Consent-based email delivery. User enters their address and ticks consent;
// the Worker (/api/place/send) builds the report and sends it. Never auto-posted.
function EmailCTA({ locale, t }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [st, setSt] = useState("idle"); // idle | sending | sent | error

  const send = async () => {
    if (!EMAIL_OK.test(email) || !consent || st === "sending") return;
    setSt("sending");
    const p = readParams();
    try {
      const res = await fetch("/api/place/send", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, locale, q: p.q, areaCode: p.areaCode, sigunguCode: p.sigunguCode, contentId: p.contentId, cl: p.cl }),
      });
      const d = await res.json().catch(() => ({ ok: false }));
      if (res.ok && d.ok) { setSt("sent"); track("place_report_email", { locale }); }
      else setSt("error");
    } catch { setSt("error"); }
  };

  if (st === "sent") return <span className="prr-email-ok">✓ {t.cta.email}</span>;
  if (!open) return <button className="btn primary" type="button" onClick={() => setOpen(true)}>✉ {t.cta.email}</button>;
  return (
    <div className="prr-email">
      <input type="email" className="prr-email-in" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label={t.cta.email} />
      <label className="prr-email-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> {t.cta.sub}
      </label>
      <button className="btn primary" type="button" disabled={!EMAIL_OK.test(email) || !consent || st === "sending"} onClick={send}>
        {st === "sending" ? "…" : t.cta.email}
      </button>
      {st === "error" && <span className="prr-email-err">{t.state.failed}</span>}
    </div>
  );
}
