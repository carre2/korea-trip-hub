"use client";
// Flagship place-report entry. Lives at the top of the home page and on /report/.
// Two tabs:
//  - Search: free text -> /<locale>/report/?q=<input>
//  - Browse step by step: region -> city/county -> category (-> when, for festivals)
//    -> list from /api/place/browse -> pick a card -> report for that exact place.
// Regions are legal-dong (법정동) codes from worker/ldong.json (static, no API call).
import { useState } from "react";
import copyAll from "../data/place-report-ui.json";
import LDONG from "../worker/ldong.json";

const CATS = ["sights", "festival", "food", "stay", "shopping", "course"];
const WHENS = ["upcoming", "month", "next"];

function fmtDate(d) {
  return d && d.length === 8 ? `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}` : "";
}

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
    const sp = new URLSearchParams({ locale, region, cat, page: String(page) });
    if (sigungu) sp.set("sigungu", sigungu);
    if (cat === "festival") sp.set("when", when);
    try {
      const res = await fetch(`/api/place/browse?${sp.toString()}`);
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) { setStatus("failed"); return; }
      setList((prev) => ({
        items: page > 1 && prev ? [...prev.items, ...data.items] : data.items,
        page: data.page, more: data.more,
      }));
      setStatus("ok");
    } catch { setStatus("failed"); }
  };

  // Changing any step invalidates the shown list.
  const reset = (fn) => (e) => { fn(e.target.value); setList(null); setStatus("idle"); };

  const href = (it) => {
    const sp = new URLSearchParams({ q: it.title, contentId: it.id, cl: it.cl });
    return `/${locale}/report/?${sp.toString()}`;
  };

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
            {CATS.map((c) => <option key={c} value={c}>{t.cats[c]}</option>)}
          </select>
        </label>
        {cat === "festival" && (
          <label className="prs-step">
            <span>4. {t.when}</span>
            <select value={when} onChange={reset(setWhen)}>
              {WHENS.map((w) => <option key={w} value={w}>{t.whens[w]}</option>)}
            </select>
          </label>
        )}
        <button className="prs-btn" type="button" disabled={!ready || status === "loading"} onClick={() => load(1)}>{t.show}</button>
      </div>

      {status === "loading" && !list && <p className="prs-note">{t.loading}</p>}
      {status === "failed" && <p className="prs-note">{t.failed}</p>}
      {list && list.items.length === 0 && <p className="prs-note">{t.empty}</p>}
      {list && list.items.length > 0 && (
        <>
          <div className="prs-results">
            {list.items.map((it) => (
              <a className="prs-card" key={`${it.cl}-${it.id}`} href={href(it)}>
                <div className={`prs-thumb${it.image ? "" : " ph"}`}>
                  {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span>📷</span>}
                </div>
                <div className="prs-cbody">
                  <h3>{it.title}</h3>
                  {it.start && <p className="prs-date">🗓️ {t.period}: {fmtDate(it.start)} – {fmtDate(it.end)}</p>}
                  {it.addr && <p className="prs-addr">📍 {it.addr}</p>}
                  {it.lang === "ko" && <span className="prr-badge ref">🇰🇷 {badge.koListing}</span>}
                </div>
              </a>
            ))}
          </div>
          {list.more && (
            <button className="btn sm prs-more" type="button" disabled={status === "loading"} onClick={() => load((list.page || 1) + 1)}>
              {status === "loading" ? t.loading : t.more}
            </button>
          )}
          <p className="prs-src">{badge.source}: TourAPI</p>
        </>
      )}
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

  const go = (val) => {
    const v = (val == null ? q : val).trim();
    if (!v) return;
    window.location.href = `/${locale}/report/?q=${encodeURIComponent(v)}`;
  };

  return (
    <section className="prs wrap" aria-labelledby="prs-title">
      <span className="beta-ribbon" aria-label="Beta test">Beta test</span>
      <span className="eyebrow">{t.eyebrow}</span>
      <H id="prs-title" className="prs-title">{t.title}</H>
      <p className="prs-sub">{t.sub}</p>
      <div className="prs-tabs" role="tablist">
        {[["search", tb.tabSearch], ["browse", tb.tabBrowse]].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`prs-tab${tab === id ? " on" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "search" ? (
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
            {t.examples.map((ex) => (
              <button key={ex} className="prs-chip" type="button" onClick={() => go(ex)}>{ex}</button>
            ))}
          </div>
        </>
      ) : (
        <Browse locale={locale} t={tb} badge={all.badge} />
      )}
    </section>
  );
}
