"use client";
// ⑩ Real-traveler video social proof. Curated, embed-verified foreigner Korea
// trips (data/video-reviews.json) shown as a facade grid: a YouTube thumbnail
// loads first, and the iframe is injected only when the viewer taps play — so
// the home page never carries 9 autoloading iframes. Category filter + the
// viewer's own language surfaced first (same pattern as the text ReviewsSection).
// Official youtube-nocookie embeds with creator credit; no fake reviews.
import { useState } from "react";
import data from "../data/video-reviews.json";
import copyAll from "../data/video-reviews-ui.json";
import { track } from "../lib/analytics";

const CATS = ["dest", "food", "kculture", "transport"];
// Category badge colors — same tokens the text ReviewsSection uses, so the two read as one system.
const CAT_STYLE = {
  dest: { bg: "var(--jade-soft)", c: "var(--jade)" },
  food: { bg: "var(--amber-soft)", c: "var(--amber)" },
  kculture: { bg: "var(--accent-soft)", c: "var(--accent)" },
  transport: { bg: "var(--primary-soft)", c: "var(--primary)" },
};

export default function VideoReviews({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  const [cat, setCat] = useState("all");
  const [playing, setPlaying] = useState(() => new Set());
  const all = data.videos || [];

  // Filter by category, then float the viewer's own language first ("in your language").
  const filtered = all
    .filter((v) => cat === "all" || v.cat === cat)
    .sort((a, b) => (b.lang === locale ? 1 : 0) - (a.lang === locale ? 1 : 0));

  const catLabel = (k) => t.cats?.[k] || k;
  const play = (v) => {
    setPlaying((prev) => new Set(prev).add(v.id));
    track("video_review_play", { locale, video_id: v.id, cat: v.cat });
  };

  return (
    <section id="reviews" className="vrev wrap" aria-labelledby="vrev-title">
      <div className="sec-head"><div>
        <span className="eyebrow">{t.eyebrow}</span>
        <h2 id="vrev-title">{t.title}</h2>
        <p>{t.intro}</p>
      </div></div>

      <div className="vrev-filters">
        <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t.all}</button>
        {CATS.map((k) => (
          <button key={k} className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>{catLabel(k)}</button>
        ))}
      </div>

      <div className="vrev-grid">
        {filtered.map((v) => {
          const cs = CAT_STYLE[v.cat] || CAT_STYLE.dest;
          const on = playing.has(v.id);
          return (
            <article className="vrev-card" key={v.id}>
              <div className="vrev-frame">
                {on ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                    title={`${v.title} — ${v.creator}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <button type="button" className="vrev-play" onClick={() => play(v)} aria-label={`${t.watch}: ${v.title} — ${v.creator}`}>
                    <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" width="480" height="360" />
                    <span className="vrev-play-ic" aria-hidden="true">▶</span>
                  </button>
                )}
              </div>
              <div className="vrev-meta">
                <span className="vrev-cat" style={{ background: cs.bg, color: cs.c }}>{catLabel(v.cat)}</span>
                <h3 className="vrev-ttl">{v.title}</h3>
                <a className="vrev-creator" href={v.channel} target="_blank" rel="noopener noreferrer">{v.creator} ↗</a>
              </div>
            </article>
          );
        })}
      </div>

      <p className="vrev-note">{t.disclaimer}</p>
    </section>
  );
}
