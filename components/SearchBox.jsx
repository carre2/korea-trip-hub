"use client";
// On-site search for a static export: a header icon opens a small panel that
// lazy-fetches the locale's prebuilt index (public/search/<locale>.json) and
// filters it in the browser. No server, no third party.
import { useState, useRef, useEffect } from "react";
import searchUi from "../data/search-ui.json";

export default function SearchBox({ locale }) {
  const t = searchUi[locale] || searchUi.en;
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(null);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  // Lazy-load the index the first time the panel opens, then focus the input.
  useEffect(() => {
    if (open && index === null) {
      fetch(`/search/${locale}.json`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setIndex(Array.isArray(d) ? d : []))
        .catch(() => setIndex([]));
    }
    if (open) { const id = setTimeout(() => inputRef.current?.focus(), 30); return () => clearTimeout(id); }
  }, [open, index, locale]);

  // Filter as the query changes: every token must hit the title or keywords;
  // title hits rank higher so the best page floats to the top.
  useEffect(() => {
    if (!index || !q.trim()) { setResults([]); return; }
    const toks = q.toLowerCase().trim().split(/\s+/).slice(0, 6);
    const scored = [];
    for (const row of index) {
      const tl = row.t.toLowerCase();
      let ok = true, score = 0;
      for (const tk of toks) {
        if (tl.includes(tk)) score += 3;
        else if (row.k.includes(tk)) score += 1;
        else { ok = false; break; }
      }
      if (ok) scored.push([score, row]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    setResults(scored.slice(0, 8).map((x) => x[1]));
  }, [q, index]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); }
    function onKey(e) { if (e.key === "Escape") { setOpen(false); } }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div className="site-search" ref={boxRef}>
      <button type="button" className="site-search-btn" aria-label={t.label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
      </button>
      {open && (
        <div className="site-search-panel">
          <input
            ref={inputRef}
            type="search"
            className="site-search-input"
            placeholder={t.placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t.label}
            autoComplete="off"
          />
          {q.trim() && (
            <ul className="site-search-results">
              {results.length === 0 ? (
                <li className="site-search-empty">{index === null ? t.loading : t.empty}</li>
              ) : (
                results.map((r) => (
                  <li key={r.p}>
                    <a href={r.p} onClick={() => setOpen(false)}>
                      <span className="site-search-r-t">{r.t}</span>
                      {r.c && <span className="site-search-r-c">{t.cats?.[r.c] || r.c}</span>}
                    </a>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
