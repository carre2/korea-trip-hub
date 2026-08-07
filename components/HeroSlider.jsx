"use client";

// Home hero: brand headline + an auto-advancing filmstrip of short looping
// Korea clips (muted, lazy). Dots below indicate/seek slides. Static-export safe.
import { useEffect, useRef, useState } from "react";
import slides from "../data/hero.json";

export default function HeroSlider({ locale = "en" }) {
  const stripRef = useRef(null);
  const [active, setActive] = useState(0);

  // Center card i inside the strip (robust — scrolls the strip, not the page).
  function scrollToCard(i) {
    const strip = stripRef.current;
    if (!strip) return;
    const card = strip.children[i];
    if (!card) return;
    const left = card.offsetLeft - (strip.clientWidth - card.clientWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }

  // Which card is closest to the strip's center right now.
  function nearestIndex() {
    const strip = stripRef.current;
    if (!strip) return 0;
    const center = strip.scrollLeft + strip.clientWidth / 2;
    let best = 0, bestD = Infinity;
    Array.from(strip.children).forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
      if (d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  // Play a card's video only while it is on screen (saves CPU / data).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const vids = strip.querySelectorAll("video");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else v.pause();
      }),
      { threshold: 0.35 }
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  // Auto-advance every 5s from wherever the strip currently is.
  useEffect(() => {
    const id = setInterval(() => {
      if (!stripRef.current) return;
      scrollToCard((nearestIndex() + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Keep the active dot in sync as the strip scrolls (auto or manual).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setActive(nearestIndex()));
    };
    strip.addEventListener("scroll", onScroll, { passive: true });
    return () => { strip.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="hero2">
      <div className="wrap hero2-in">
        <div className="hero2-text">
          <h1 className="hero2-h">Everything you need to <span className="k">visit Korea</span></h1>
          <p className="hero2-sub">Visa · Airport · Transit · SIM · Food · day-by-day itineraries — free, in 10 languages.</p>
          <a className="hero2-cta" href={`/${locale}/#plan`}>Plan your trip →</a>
        </div>

        <div className="hero2-right">
          <div className="hero2-strip" ref={stripRef}>
            {slides.map((s) => (
              <a key={s.label} className="hero-card" href={`/${locale}${s.href}`}>
                <video src={s.video} poster={s.poster} muted loop playsInline preload="none" aria-label={s.label} />
                <span className="hero-card-lbl">{s.label}<em>{s.sub}</em></span>
              </a>
            ))}
          </div>
          <div className="hero2-dots" role="tablist" aria-label="Hero slides">
            {slides.map((s, i) => (
              <button
                key={s.label}
                className={`hero2-dot${i === active ? " on" : ""}`}
                aria-label={`Show ${s.label}`}
                aria-selected={i === active}
                onClick={() => scrollToCard(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
