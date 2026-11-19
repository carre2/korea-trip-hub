"use client";
// The trip "spine": an always-visible A-to-Z checklist. Each step links to the
// on-site guide; ticks persist on the device (localStorage) and travel in a
// shareable link (?checklist=), so it can be emailed/shared via ShareTools.
import { useState, useEffect } from "react";
import ui from "../data/tripchecklist-ui.json";
import ShareTools from "./ShareTools";
import { track } from "../lib/analytics";

const KEY = "kth_checklist";

export default function TripChecklist({ locale, items }) {
  const t = ui[locale] || ui.en;
  const [checked, setChecked] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("checklist");
      if (q !== null) setChecked(q.split(",").filter(Boolean));
      else { const s = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(s)) setChecked(s.filter((x) => typeof x === "string")); }
    } catch { /* private mode / blocked storage */ }
    setReady(true);
  }, []);

  function persist(next) { try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} }
  function toggle(id) {
    const next = checked.includes(id) ? checked.filter((x) => x !== id) : [...checked, id];
    setChecked(next); persist(next);
    track("checklist_progress", { locale, item_id: id, completed_count: next.length });
  }
  function getUrl() {
    const u = new URL(window.location.origin + `/${locale}/`);
    if (checked.length) u.searchParams.set("checklist", checked.join(","));
    u.hash = "planner";
    return u.href;
  }

  const done = checked.length, total = items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="tchk">
      <div className="tchk-head">
        <div className="tchk-head-txt"><h3 className="tchk-title">🧭 {t.title}</h3><p className="tchk-sub">{t.sub}</p></div>
        <div className="tchk-ring" role="img" aria-label={t.progress.replace("{done}", done).replace("{total}", total)}>
          <div className="tchk-ring-bar"><span style={{ width: pct + "%" }} /></div>
          <b>{done}/{total}</b>
        </div>
      </div>
      <ul className="tchk-list">
        {items.map((it) => {
          const isDone = checked.includes(it.id);
          return (
            <li key={it.id} className={`tchk-item${isDone ? " is-done" : ""}`}>
              <label className="tchk-check">
                <input type="checkbox" checked={isDone} onChange={() => toggle(it.id)} aria-label={it.label} />
                <span className="tchk-ic" aria-hidden="true">{it.icon}</span>
                <span className="tchk-lbl">{it.label}{it.note && <small className="tchk-note">{it.note}</small>}</span>
              </label>
              <a className="tchk-go" href={it.href} target={it.external ? "_blank" : undefined} rel={it.external ? "noopener noreferrer" : undefined} onClick={() => track("checklist_guide_click", { locale, item_id: it.id })}>
                {t.guide} <span aria-hidden="true">↗</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="tchk-foot">
        {ready && <ShareTools locale={locale} title={t.title} getUrl={getUrl} />}
        {done > 0 && <button type="button" className="tchk-reset" onClick={() => { setChecked([]); persist([]); }}>{t.reset}</button>}
      </div>
    </div>
  );
}
