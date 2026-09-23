"use client";
import { useEffect, useState } from 'react';
import { TRIP_KEY, normalizeTrip, encodeTrip, decodeTrip } from '../lib/trip-state.mjs';
import {PLACES_KEY,normalizePlaces,decodePlaces} from '../lib/places-state.mjs';
import placeLinks from '../data/itinerary-links.json';
import { track } from '../lib/analytics';

export default function TripPlanner({ locale, routes, order, ui, labels: t, checklist, catalog }) {
  const [selected, setSelected] = useState(order[0]);
  const [trip, setTrip] = useState(null);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('');
  const [copyFallback, setCopyFallback] = useState('');
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const current = trip && routes[trip.route];
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get('trip');
    if (shared !== null) {
      const restored = decodeTrip(shared, routes);
      if (restored) { setTrip(restored); setSelected(restored.route); setStatus(t.shared); }
      else setStatus(t.invalidShare);
    } else {
      try {
        const restored = normalizeTrip(JSON.parse(localStorage.getItem(TRIP_KEY)), routes);
        if (restored) { setTrip(restored); setSelected(restored.route); setSaved(true); setStatus(t.saved); track('itinerary_resume', { locale, route_id: restored.route }); }
      } catch { /* fresh or unavailable storage */ }
    }
    setReady(true);
  }, [locale, routes, t]);
  // Loading a shared link never overwrites a previously saved trip.
  function clearSharedQuery() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('trip')) { url.searchParams.delete('trip'); window.history.replaceState(null, '', url.href); }
  }
  function persist(next) {
    try { localStorage.setItem(TRIP_KEY, JSON.stringify(next)); clearSharedQuery(); setSaved(true); setStatus(t.saved); return true; }
    catch { setSaved(false); setStatus(t.storageError); return false; }
  }
  function update(next) { setTrip(next); setCopyFallback(''); if (saved) persist(next); }
  function preview() {
    clearSharedQuery();
    setTrip({ v: 1, route: selected, excluded: [], checked: [] }); setSaved(false); setStatus(t.preview); setCopyFallback('');
    track('itinerary_generate', { locale, route_id: selected });
  }
  function save() { if (persist(trip)) track('itinerary_save', { locale, route_id: trip.route }); }
  function remove() {
    try { localStorage.removeItem(TRIP_KEY); setSaved(false); setStatus(t.removed); } catch { setStatus(t.storageError); }
  }
  async function copy() {
    const url = new URL(`/${locale}/`, window.location.origin);
    url.searchParams.set('trip', encodeTrip(trip));
    try {const q=new URLSearchParams(location.search).get('places');const places=q!==null?decodePlaces(q,catalog):normalizePlaces(JSON.parse(localStorage.getItem(PLACES_KEY)||'[]'),catalog);if(places.length)url.searchParams.set('places',places.join(','));}catch{}
    url.hash = 'planner';
    try { await navigator.clipboard.writeText(url.href); setStatus(t.copyDone); setCopyFallback(url.href); track('itinerary_share', { locale, route_id: trip.route }); }
    catch { setCopyFallback(url.href); setStatus(t.copyError); }
  }
  function ordered(day) {const indexed=day.stops.map((stop,index)=>({stop,id:day.n+'-'+index}));return trip.order ? indexed.sort((a,b)=>{const ai=trip.order.indexOf(a.id),bi=trip.order.indexOf(b.id);return (ai<0?999:ai)-(bi<0?999:bi)}) : indexed;}
  function move(day,id,delta){const list=ordered(day).filter(x=>!trip.excluded.includes(x.id)).map(x=>x.id);const i=list.indexOf(id),j=i+delta;if(j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];const rest=(trip.order||[]).filter(x=>!list.includes(x));update({...trip,order:[...rest,...list]});}
  function toggleCheck(id) {
    const checked = trip.checked.includes(id) ? trip.checked.filter((key) => key !== id) : [...trip.checked, id];
    update({ ...trip, checked }); track('checklist_progress', {locale,item_id:id,completed_count:checked.length});
  }
  return <div className="trip-workspace">
    <div className="trip-controls"><label htmlFor="trip-route">{t.chooseRoute}</label>
      <div className="trip-select-row"><select id="trip-route" value={selected} onChange={(e) => { setSelected(e.target.value); if(!started){track('planner_start', { locale, route_id: e.target.value, placement:'home' });setStarted(true)} }}>
        {order.map((key) => <option key={key} value={key}>{routes[key].title}</option>)}
      </select><button type="button" className="btn" disabled={!ready} onClick={preview}>{t.preview} →</button></div>
    </div>
    <p className="trip-status" role="status" aria-live="polite">{status || t.empty}</p>
    {current && <>
      <div className="trip-heading"><h3>{current.title}</h3><a href={`/${locale}/itinerary/${trip.route}/`}>{t.details} →</a></div>
      <div className="trip-toolbar"><button type="button" className="btn" onClick={save}>{saved ? `✓ ${t.saved}` : t.save}</button>
        <button type="button" className="btn ghost" onClick={copy}>{t.copy}</button><button type="button" className="btn ghost" onClick={() => window.print()}>{t.print}</button>
        {saved && <button type="button" className="trip-text-button" onClick={remove}>{t.removeSave}</button>}
      </div><p className="trip-storage-note">{t.storageNote}</p>
      {copyFallback && <input className="trip-copy" aria-label={t.copy} value={copyFallback} readOnly onFocus={(e) => e.target.select()} />}
      <div className="trip-layout"><div className="trip-itinerary">
        <div className="trip-subhead"><span>{t.customize}</span><small>{t.placesHint}</small>{trip.excluded.length > 0 && <button type="button" className="trip-text-button" onClick={() => update({ ...trip, excluded: [] })}>{t.restoreStops}</button>}</div>
        {current.plan.map((day) => <section className="trip-day" key={day.n}><h4><span>{ui.dayLabel.replace('{n}', day.n)}</span> {day.area}</h4>
          <ol>{ordered(day).filter(x=>!trip.excluded.includes(x.id)).map(({stop,id}, index) => {
            return <li key={id}><span className="trip-time">{trip.order ? index+1 : stop.t}</span><div><p>{stop.p}</p>
              {placeLinks[stop.spot] && <a className="trip-detail" href={`/${locale}/destinations/${placeLinks[stop.spot]}/`}>{t.details} →</a>}
              {stop.spot && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.spot)}`} target="_blank" rel="noopener noreferrer">{ui.map} ↗</a>}
            </div><div className="trip-stop-actions"><button type="button" disabled={index===0} aria-label={`${t.moveUp}: ${stop.p}`} onClick={()=>move(day,id,-1)}>↑</button><button type="button" disabled={index===ordered(day).filter(x=>!trip.excluded.includes(x.id)).length-1} aria-label={`${t.moveDown}: ${stop.p}`} onClick={()=>move(day,id,1)}>↓</button><button type="button" className="trip-remove" aria-label={`${t.removeStop}: ${stop.p}`} onClick={() => update({ ...trip, excluded: [...trip.excluded, id] })}>×</button></div></li>;
          })}</ol></section>)}
      </div><aside className="trip-checklist" aria-label={t.checklist}><h3>{t.checklist}</h3>
        <p aria-live="polite">{t.progress.replace('{done}', trip.checked.length).replace('{total}', checklist.length)}</p><progress value={trip.checked.length} max={checklist.length} aria-label={t.checklist} />
        {checklist.map((item) => <div className="trip-check" key={item.id}><label><input type="checkbox" checked={trip.checked.includes(item.id)} onChange={() => toggleCheck(item.id)} />{item.label}</label><a href={`/${locale}/${item.path}/`} aria-label={`${t.details}: ${item.label}`}>↗</a></div>)}
        <button type="button" className="trip-text-button" onClick={() => update({ ...trip, checked: [] })}>{t.resetChecklist}</button>
      </aside></div>
    </>}
  </div>;
}
