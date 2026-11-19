"use client";
// On-site search for a static export. A small inline field (input on the left,
// magnifier on the right) lives in the header at every width — on narrow screens
// it simply shrinks instead of collapsing to an icon. Results drop down below it
// (viewport-wide on compact headers). It lazy-fetches the locale's prebuilt index
// (public/search/<locale>.json) and filters it in the browser: no server, no third party.
import { useState, useRef, useEffect } from "react";
import searchUi from "../data/search-ui.json";

export default function SearchBox({ locale }) {
  const t = searchUi[locale] || searchUi.en;
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(null);
  const [results, setResults] = useState([]);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Lazy-load the index the first time the field is engaged.
  useEffect(() => {
    if (focused && index === null) {
      fetch(`/search/${locale}.json`)
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setIndex(Array.isArray(d) ? d : []))
        .catch(() => setIndex([]));
    }
  }, [focused, index, locale]);

  // Filter as the query changes: every token must hit the title or keywords;
  // title hits rank higher so the best page floats to the top.
  useEffect(() => {
    setActive(-1);
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

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    function onDoc(e) { if (boxRef.current && !boxRef.current.contains(e.target)) setFocused(false); }
    function onKey(e) { if (e.key === "Escape") { setFocused(false); inputRef.current?.blur(); } }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  // Keep the keyboard-highlighted result scrolled into view.
  useEffect(() => {
    if (active < 0 || !listRef.current) return;
    listRef.current.querySelectorAll("a")[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(p) { setFocused(false); inputRef.current?.blur(); window.location.href = p; }

  // Arrow keys move the highlight; Enter opens the highlighted (or first) result.
  function onKeyDown(e) {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? results.length - 1 : a - 1)); }
    else if (e.key === "Enter") { const r = results[active] || results[0]; if (r) { e.preventDefault(); go(r.p); } }
  }

  const showDrop = focused && q.trim();

  return (
    <div className="site-search" ref={boxRef}>
      <form
        className="site-search-field"
        role="search"
        onSubmit={(e) => { e.preventDefault(); const r = results[active] || results[0]; if (r) go(r.p); }}
      >
        <input
          ref={inputRef}
          type="search"
          className="site-search-input"
          placeholder={t.placeholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={onKeyDown}
          aria-label={t.label}
          role="combobox"
          aria-expanded={showDrop && results.length > 0 ? true : false}
          aria-controls="site-search-list"
          autoComplete="off"
        />
        <button type="submit" className="site-search-go" aria-label={t.label} tabIndex={-1}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
        </button>
      </form>

      {showDrop && (
        <ul className="site-search-results site-search-drop" id="site-search-list" ref={listRef} role="listbox">
          {results.length === 0 ? (
            <li className="site-search-empty">{index === null ? t.loading : t.empty}</li>
          ) : (
            results.map((r, i) => (
              <li key={r.p} role="option" aria-selected={i === active}>
                <a href={r.p} className={i === active ? "is-active" : ""} onClick={() => go(r.p)} onMouseEnter={() => setActive(i)}>
                  <span className="site-search-r-t">{r.t}</span>
                  {r.c && <span className="site-search-r-c">{t.cats?.[r.c] || r.c}</span>}
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
