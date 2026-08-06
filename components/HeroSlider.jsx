"use client";

// Home hero: brand headline + an auto-scrolling filmstrip of short looping
// Korea clips (muted, lazy — videos only play while on screen). Each card links
// to the matching section. Static-export friendly (client component, no SSR data).
import { useEffect, useRef } from "react";
import slides from "../data/hero.json";

export default function HeroSlider({ locale = "en" }) {
  const stripRef = useRef(null);

  // Play a card's video only while it is on screen (saves CPU / data).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const vids = strip.querySelectorAll("video");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const v = e.target;
          if (e.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
          else v.pause();
        });
      },
      { threshold: 0.35 }
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  // Gentle auto-advance; stops once the visitor scrolls the strip themselves.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    let i = 0, stopped = false;
    const stop = () => { stopped = true; };
    strip.addEventListener("pointerdown", stop, { once: true });
    const id = setInterval(() => {
      if (stopped) return;
      const cards = strip.children;
      if (!cards.length) return;
      i = (i + 1) % cards.length;
      cards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, 4200);
    return () => { clearInterval(id); strip.removeEventListener("pointerdown", stop); };
  }, []);

  return (
    <section className="hero2">
      <div className="wrap hero2-in">
        <div className="hero2-text">
          <h1 className="hero2-h">Everything you need to <span className="k">visit Korea</span></h1>
          <p className="hero2-sub">Visa · Airport · Transit · SIM · Food · day-by-day itineraries — free, in 10 languages.</p>
          <a className="hero2-cta" href={`/${locale}/#plan`}>Plan your trip →</a>
        </div>

        <div className="hero2-strip" ref={stripRef}>
          {slides.map((s) => (
            <a key={s.label} className="hero-card" href={`/${locale}${s.href}`}>
              <video
                src={s.video}
                poster={s.poster}
                muted
                loop
                playsInline
                preload="none"
                aria-label={s.label}
              />
              <span className="hero-card-lbl">
                {s.label}
                <em>{s.sub}</em>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
