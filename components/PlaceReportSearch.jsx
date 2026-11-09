"use client";
// Flagship place-report entry. Lives at the top of the home page and on /report/.
// Three tabs:
//  - Search: free text -> /<locale>/report/?q=<input>
//  - Map: Korea -> region -> 시군구 bubbles -> category -> pins + cards (PlaceMapExplore)
//  - Step by step: region -> city/county -> category (-> when, for festivals) -> cards
// Every card opens the report for that exact place. Regions are legal-dong (법정동)
// codes from worker/ldong.json (static, no API call).
import { useState } from "react";
import copyAll from "../data/place-report-ui.json";
import LDONG from "../worker/ldong.json";
import PlaceMapExplore from "./PlaceMapExplore";
import { BROWSE_CATS, BROWSE_WHENS, fetchBrowse, ResultCards } from "./PlaceBrowseCards";

// Example chips show a localized name but search the Korean one: Hangul queries resolve
// on every page language, while 明洞 / Мёндон / "Yesan Market" need language services
// our TourAPI key doesn't have (checked 2026-11-09). Order matches search.examples.
const EXAMPLE_QUERIES = ["명동", "제주", "경주", "예산시장"];

function Browse({ locale, t, badge }) {
  const nameOf = (x) => (locale === "ko" ? x.ko : x.en || x.ko);
  const [region, setRegion] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [cat, setCat] = useState("");
  const [when, setWhen] = useState("upcoming");
  const [list, setList] = useState(null); // { items, page, more }
  const [status, setStatus] = useState("idle"); // idle | loading | ok | failed

  const reg = LDONG.regions.find((r) => String(r.code) === region);
  const ready = region && cat;

  const load = async (page = 1) => {
    if (!ready) return;
    setStatus("loading");
    const data = await fetchBrowse({ locale, region, sigungu, cat, when, page });
    if (!data.ok) { setStatus("failed"); return; }
    setList((prev) => ({ items: page > 1 && prev ? [...prev.items, ...data.items] : data.items, page: data.page, more: data.more }));
    setStatus("ok");
  };

  // Changing any step invalidates the shown list.
  const reset = (fn) => (e) => { fn(e.target.value); setList(null); setStatus("idle"); };

  return (
    <div className="prs-browse">
      <div className="prs-steps">
        <label className="prs-step">
          <span>1. {t.region}</span>
          <select value={region} onChange={(e) => { setRegion(e.target.value); setSigungu(""); setList(null); setStatus("idle"); }}>
            <option value="">{t.choose}</option>
            {LDONG.regions.map((r) => <option key={r.code} value={String(r.code)}>{nameOf(r)}</option>)}
          </select>
        </label>
        <label className="prs-step">
          <span>2. {t.sigungu}</span>
          <select value={sigungu} onChange={reset(setSigungu)} disabled={!reg}>
            <option value="">{t.all}</option>
            {(reg ? reg.sigungu : []).map((s) => <option key={s.code} value={s.code}>{nameOf(s)}</option>)}
          </select>
        </label>
        <label className="prs-step">
          <span>3. {t.cat}</span>
          <select value={cat} onChange={reset(setCat)} disabled={!region}>
            <option value="">{t.choose}</option>
            {BROWSE_CATS.map((c) => <option key={c} value={c}>{t.cats[c]}</option>)}
          </select>
        </label>
        {cat === "festival" && (
          <label className="prs-step">
            <span>4. {t.when}</span>
            <select value={when} onChange={reset(setWhen)}>
              {BROWSE_WHENS.map((w) => <option key={w} value={w}>{t.whens[w]}</option>)}
            </select>
          </label>
        )}
        <button className="prs-btn" type="button" disabled={!ready || status === "loading"} onClick={() => load(1)}>{t.show}</button>
      </div>
      <ResultCards locale={locale} list={list} status={status} t={t} badge={badge} onMore={() => load((list?.page || 1) + 1)} />
    </div>
  );
}

export default function PlaceReportSearch({ locale, level = 2 }) {
  const all = copyAll[locale] || copyAll.en;
  const t = all.search;
  const tb = all.browse;
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("search");
  const H = level === 1 ? "h1" : "h2";

  const go = (val, label) => {
    const v = (val == null ? q : val).trim();
    if (!v) return;
    const sp = new URLSearchParams({ q: v });
    if (label && label !== v) sp.set("label", label);
    window.location.href = `/${locale}/report/?${sp.toString()}`;
  };

  return (
    <section className="prs wrap" aria-labelledby="prs-title">
      <span className="beta-ribbon" aria-label="Beta test">Beta test</span>
      <span className="eyebrow">{t.eyebrow}</span>
      <H id="prs-title" className="prs-title">{t.title}</H>
      <p className="prs-sub">{t.sub}</p>
      <div className="prs-tabs" role="tablist">
        {[["search", tb.tabSearch], ["map", tb.tabMap], ["browse", tb.tabBrowse]].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`prs-tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "search" && (
        <>
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
            {t.examples.map((ex, i) => (
              <button key={ex} className="prs-chip" type="button" onClick={() => go(EXAMPLE_QUERIES[i] || ex, ex)}>{ex}</button>
            ))}
          </div>
        </>
      )}
      {tab === "map" && <PlaceMapExplore locale={locale} t={tb} badge={all.badge} />}
      {tab === "browse" && <Browse locale={locale} t={tb} badge={all.badge} />}
    </section>
  );
}
