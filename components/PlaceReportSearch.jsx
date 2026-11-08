"use client";
// Flagship place-report search. Lives at the top of the home page and on /report/.
// Submitting navigates to /<locale>/report/?q=<input>, where PlaceReport fetches
// and renders the live TourAPI report. No data is shown here — just the entry point.
import { useState } from "react";
import copyAll from "../data/place-report-ui.json";

export default function PlaceReportSearch({ locale, level = 2 }) {
  const t = (copyAll[locale] || copyAll.en).search;
  const [q, setQ] = useState("");
  const H = level === 1 ? "h1" : "h2";

  const go = (val) => {
    const v = (val == null ? q : val).trim();
    if (!v) return;
    window.location.href = `/${locale}/report/?q=${encodeURIComponent(v)}`;
  };

  return (
    <section className="prs wrap" aria-labelledby="prs-title">
      <span className="eyebrow">{t.eyebrow}</span>
      <H id="prs-title" className="prs-title">{t.title}</H>
      <p className="prs-sub">{t.sub}</p>
      <form className="prs-form" onSubmit={(e) => { e.preventDefault(); go(); }}>
        <input
          className="prs-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.placeholder}
          aria-label={t.title}
          enterKeyHint="search"
        />
        <button className="prs-btn" type="submit">{t.button}</button>
      </form>
      <div className="prs-ex">
        <span className="prs-ex-label">{t.examplesLabel}:</span>
        {t.examples.map((ex) => (
          <button key={ex} className="prs-chip" type="button" onClick={() => go(ex)}>{ex}</button>
        ))}
      </div>
    </section>
  );
}
