"use client";

import { useState } from "react";
import reviewsData from "../data/reviews.json";
import { REVIEW_FORM_URL } from "../lib/config";

const CATS = [
  { key: "dest", labelKey: "catDest" },
  { key: "food", labelKey: "catFood" },
  { key: "kculture", labelKey: "catKculture" },
  { key: "transport", labelKey: "catTransport" },
];

// Category badge colors (semantic-ish, reused across the site).
const CAT_STYLE = {
  dest: { bg: "var(--jade-soft)", c: "var(--jade)" },
  food: { bg: "var(--amber-soft)", c: "var(--amber)" },
  kculture: { bg: "var(--accent-soft)", c: "var(--accent)" },
  transport: { bg: "var(--primary-soft)", c: "var(--primary)" },
};

export default function ReviewsSection({ t, locale }) {
  const [cat, setCat] = useState("all");
  const all = reviewsData.reviews || [];

  // Filter by category, then sort the viewer's own language first ("in your language").
  const filtered = all
    .filter((r) => cat === "all" || r.cat === cat)
    .sort((a, b) => (b.lang === locale ? 1 : 0) - (a.lang === locale ? 1 : 0));

  const catLabel = (k) => t[CATS.find((c) => c.key === k)?.labelKey] || k;

  return (
    <>
      <div className="rev-filters">
        <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t.all}</button>
        {CATS.map((c) => (
          <button key={c.key} className="chip" aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>
            {t[c.labelKey]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rev-empty">
          <div className="rev-empty-ic">✍️</div>
          <p className="rev-empty-h">{t.empty}</p>
          <p className="rev-empty-sub">
            {t.emptyPrompt || "Been to Korea? Share one quick tip — a great meal, a money-saver, or a “wish I’d known”. It helps the next traveler."}
          </p>
          {REVIEW_FORM_URL ? (
            <a className="btn" href={REVIEW_FORM_URL} target="_blank" rel="noopener noreferrer">✍️ {t.cta}</a>
          ) : (
            <button className="btn ghost" disabled aria-disabled="true">✍️ {t.ctaSoon}</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid g3">
            {filtered.map((r, i) => {
              const cs = CAT_STYLE[r.cat] || CAT_STYLE.dest;
              return (
                <article className="rev-card" key={i}>
                  <div className="rev-top">
                    <span className="avatar" style={{ background: "var(--primary)" }}>{(r.name || "?")[0]}</span>
                    <div className="who"><b>{r.name}</b><div className="sub">{r.city}</div></div>
                    {r.flag && <span className="langflag">{r.flag}</span>}
                  </div>
                  <span className="rev-cat" style={{ background: cs.bg, color: cs.c }}>{catLabel(r.cat)}</span>
                  <div className="stars">{"★".repeat(Math.max(1, Math.min(5, r.rating || 5)))}</div>
                  <p>{r.body}</p>
                </article>
              );
            })}
          </div>
          <div style={{ marginTop: 18 }}>
            {REVIEW_FORM_URL ? (
              <a className="btn" href={REVIEW_FORM_URL} target="_blank" rel="noopener noreferrer">✍️ {t.cta}</a>
            ) : (
              <button className="btn ghost" disabled aria-disabled="true">✍️ {t.ctaSoon}</button>
            )}
          </div>
        </>
      )}
    </>
  );
}
