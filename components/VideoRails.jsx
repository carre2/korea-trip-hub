"use client";
// ⑩b Desktop side rails — fills the wide empty margins on large screens with a
// few video thumbnails that are visible from the first screen (fixed position).
// Clicking opens a centered lightbox (the rail is too narrow to play inline).
// CSS hides the rails below ~1480px, where there is no margin room; on phones /
// narrow screens the in-flow VideoReviews gallery (moved up near the hero)
// carries the videos instead. Same data + oEmbed-verified ids as the gallery.
import { useState, useEffect } from "react";
import data from "../data/video-reviews.json";
import copyAll from "../data/video-reviews-ui.json";
import { track } from "../lib/analytics";

export default function VideoRails({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  const [open, setOpen] = useState(null); // the video playing in the lightbox
  const all = data.videos || [];
  // Float the viewer's own language first, then take 6 for the two rails — so a
  // Thai/Vietnamese/etc. visitor sees a traveler from their country up top too.
  const rail = [...all].sort((a, b) => (b.lang === locale ? 1 : 0) - (a.lang === locale ? 1 : 0)).slice(0, 6);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const play = (v) => { setOpen(v); track("video_review_play", { locale, video_id: v.id, cat: v.cat }); };

  const Rail = ({ items, side }) => (
    <aside className={`vrail vrail-${side}`} aria-label={t.title}>
      {items.map((v) => (
        <button type="button" key={v.id} className="vrail-item" onClick={() => play(v)} aria-label={`${t.watch}: ${v.title} — ${v.creator}`}>
          <span className="vrail-thumb">
            <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" width="320" height="180" />
            <span className="vrail-play" aria-hidden="true">▶</span>
          </span>
          <span className="vrail-ttl">{v.title}</span>
          <span className="vrail-by">{v.creator}</span>
        </button>
      ))}
    </aside>
  );

  return (
    <>
      <Rail items={rail.slice(0, 3)} side="left" />
      <Rail items={rail.slice(3, 6)} side="right" />
      {open && (
        <div className="vlight" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <div className="vlight-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="vlight-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <div className="vlight-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0`}
                title={`${open.title} — ${open.creator}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="vlight-meta">
              <span>{open.title}</span>
              <a href={open.channel} target="_blank" rel="noopener noreferrer">{open.creator} ↗</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
