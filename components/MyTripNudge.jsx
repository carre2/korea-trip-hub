"use client";
// Persistent invitation on the home page: a friendly bubble that points a curved
// arrow up at the "My trip" nav link (the planner category) and invites the
// visitor to build their whole Korea plan in one place. It measures the real nav
// element, so the arrow lands correctly in every locale and width; when the nav
// is collapsed into the hamburger (<1280px) it points at the toggle instead.
// Shown on every home-page visit (the sticky header keeps it attached while you
// scroll); a visitor can close it for the session with the × or Esc, and it
// never blocks the link it points at. The CTA scrolls to #planner.
import { useEffect, useRef, useState } from "react";
import copy from "../data/mytrip-nudge-ui.json";

const BUBBLE_W = 300;

export default function MyTripNudge({ locale, label = "My trip" }) {
  const t = copy[locale] || copy.en;
  const [spot, setSpot] = useState(null); // { cx, bottom, mode }
  const targetRef = useRef(null);
  const closedRef = useRef(false);
  const fmt = (s) => (s || "").replace("{label}", label);

  const clearGlow = () => {
    if (targetRef.current) targetRef.current.classList.remove("mytrip-glow");
    targetRef.current = null;
  };

  const hide = () => { clearGlow(); setSpot(null); };
  const dismiss = () => { closedRef.current = true; hide(); }; // closed for this session only

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== `/${locale}/`) return; // home only

    let alive = true;
    const pick = () => {
      const link = document.querySelector(".nav-mytrip");
      const toggle = document.querySelector(".nav-toggle");
      if (link && link.getClientRects().length && link.offsetParent !== null) return { el: link, mode: "link" };
      if (toggle && toggle.getClientRects().length && toggle.offsetParent !== null) return { el: toggle, mode: "menu" };
      return null;
    };
    const measure = () => {
      if (!alive || closedRef.current) return;
      const p = pick();
      if (!p) { hide(); return; }
      const r = p.el.getBoundingClientRect();
      if (targetRef.current && targetRef.current !== p.el) clearGlow();
      targetRef.current = p.el;
      p.el.classList.add("mytrip-glow");
      setSpot({ cx: r.left + r.width / 2, bottom: r.bottom, mode: p.mode });
    };

    const timer = setTimeout(measure, 1100);
    let raf = 0;
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    const onKey = (e) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      clearTimeout(timer); cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      clearGlow();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  function goPlanner() {
    dismiss();
    const el = document.getElementById("planner");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("planner-flash");
      setTimeout(() => el.classList.remove("planner-flash"), 2200);
    } else {
      window.location.hash = "#planner";
    }
  }

  if (!spot) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const T = { x: spot.cx, y: spot.bottom + 4 };
  const bubbleLeft = Math.max(12, Math.min(Math.round(T.x - BUBBLE_W / 2), vw - BUBBLE_W - 12));
  const bubbleTop = Math.round(T.y + 48);
  const S = { x: Math.max(bubbleLeft + 28, Math.min(bubbleLeft + BUBBLE_W - 28, T.x)), y: bubbleTop - 6 };
  const Q = { x: (S.x + T.x) / 2 + (S.x < T.x ? 24 : -24), y: (S.y + T.y) / 2 };
  const path = `M ${S.x} ${S.y} Q ${Q.x} ${Q.y} ${T.x} ${T.y + 9}`;

  return (
    <>
      <svg className="tnudge-arrow" width={vw} height={Math.max(bubbleTop + 12, 220)} aria-hidden="true">
        <path d={path} />
        <polygon points={`${T.x - 7},${T.y + 13} ${T.x + 7},${T.y + 13} ${T.x},${T.y}`} />
      </svg>
      <div className="tnudge" role="dialog" aria-label={fmt(t.aria)} style={{ left: bubbleLeft, top: bubbleTop, width: BUBBLE_W }}>
        <button type="button" className="tnudge-x" aria-label={t.close} onClick={dismiss}>✕</button>
        <strong className="tnudge-title">{t.title}</strong>
        <p className="tnudge-body">{fmt(spot.mode === "menu" ? t.bodyMenu : t.body)}</p>
        <button type="button" className="tnudge-cta" onClick={goPlanner}>{t.cta}</button>
      </div>
    </>
  );
}
