"use client";
// ④ Standalone, always-visible arrival checklist. Persists to localStorage
// (functional storage, like the trip planner) so returning visitors keep their
// progress — a lightweight retention device. Each row links to the matching
// guide; progress fires checklist_progress (already whitelisted) for measurement.
import { useEffect, useState } from 'react';
import copyAll from '../data/checklist-ui.json';
import { track } from '../lib/analytics';

const KEY = 'kth_prep_v1';
const ITEMS = [
  { id: 'keta', href: 'plan/visa' },
  { id: 'esim', href: 'plan/sim' },
  { id: 'arex', href: 'plan/airport' },
  { id: 'card', href: 'plan/transit' },
  { id: 'maps', href: 'plan/transit' },
];

export default function PreflightChecklist({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  const [done, setDone] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const raw = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(raw)) setDone(raw.filter((x) => typeof x === 'string')); } catch { /* unavailable storage */ }
    setReady(true);
  }, []);
  function toggle(id) {
    setDone((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* unavailable storage */ }
      track('checklist_progress', { locale, item_id: id, completed_count: next.length });
      return next;
    });
  }
  const count = ITEMS.filter((i) => done.includes(i.id)).length;
  const allDone = count === ITEMS.length;
  return (
    <section className="prep wrap" aria-label={t.title}>
      <div className="sec-head"><h2>{t.title}</h2></div>
      <p className="prep-intro">{t.intro}</p>
      <div className="prep-bar"><div className="prep-bar-fill" style={{ width: `${(count / ITEMS.length) * 100}%` }} /></div>
      <p className="prep-count" aria-live="polite">{allDone ? t.ready : t.count.replace('{done}', count).replace('{total}', ITEMS.length)}</p>
      <ul className="prep-list">
        {ITEMS.map((item) => {
          const on = done.includes(item.id);
          return (
            <li key={item.id} className={on ? 'is-on' : ''}>
              <label><input type="checkbox" checked={on} onChange={() => toggle(item.id)} disabled={!ready} />{t.items[item.id]}</label>
              <a href={`/${locale}/${item.href}/`} aria-label={t.items[item.id]}>↗</a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
