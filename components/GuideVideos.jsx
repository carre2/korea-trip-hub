"use client";
// A small facade row of related, embed-verified YouTube videos for a guide,
// filtered from the curated data/video-reviews.json by category. Same safe
// pattern as VideoReviews: a thumbnail loads first; the iframe is injected only
// when the viewer taps play. Real creators, credited; no fake reviews.
import { useState } from "react";
import data from "../data/video-reviews.json";
import copyAll from "../data/video-reviews-ui.json";
import { track } from "../lib/analytics";

export default function GuideVideos({ locale, cats, max = 3 }) {
  const t = copyAll[locale] || copyAll.en;
  const [playing, setPlaying] = useState(() => new Set());
  const catList = Array.isArray(cats) ? cats : [cats];
  const vids = (data.videos || [])
    .filter((v) => catList.includes(v.cat))
    .sort((a, b) => (b.lang === locale ? 1 : 0) - (a.lang === locale ? 1 : 0))
    .slice(0, max);
  if (!vids.length) return null;

  const play = (v) => {
    setPlaying((p) => new Set(p).add(v.id));
    track("video_review_play", { locale, video_id: v.id, cat: v.cat });
  };

  return (
    <section className="gvid" aria-label={t.title}>
      <h2>▶ {t.title}</h2>
      <div className="gvid-grid">
        {vids.map((v) => (
          <div className="gvid-item" key={v.id}>
            {playing.has(v.id) ? (
              <div className="gvid-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                  title={`${v.title} — ${v.creator}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <button type="button" className="gvid-thumb" onClick={() => play(v)} aria-label={`${t.watch}: ${v.title} — ${v.creator}`}>
                <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" width="320" height="180" />
                <span className="gvid-play" aria-hidden="true">▶</span>
              </button>
            )}
            <p className="gvid-ttl">{v.title}</p>
            <p className="gvid-by">{v.creator}</p>
          </div>
        ))}
      </div>
      <p className="gvid-note">{t.disclaimer}</p>
    </section>
  );
}
