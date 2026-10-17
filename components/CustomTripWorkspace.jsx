"use client";
import {useEffect,useState} from 'react';
import {CUSTOM_TRIP_KEY,normalizeCustomTrip,tripPlaces,tripBases,baseQuery,placeQuery,mapLeg} from '../lib/custom-trip.mjs';
import {stay22Hotels} from '../lib/booking';
import {track} from '../lib/analytics';

export default function CustomTripWorkspace({draft,locale,labels:c,controls:t,affiliateNote,catalog,onChange}){
 const [trip,setTrip]=useState(draft||null),[saved,setSaved]=useState(false),[status,setStatus]=useState('');
 useEffect(()=>{
  if(draft)return;
  const load=()=>{try{const restored=normalizeCustomTrip(JSON.parse(localStorage.getItem(CUSTOM_TRIP_KEY)));setTrip(restored);setSaved(!!restored);}catch{setTrip(null);}};
  load();window.addEventListener('kth-custom-trip-saved',load);window.addEventListener('storage',load);
  return()=>{window.removeEventListener('kth-custom-trip-saved',load);window.removeEventListener('storage',load);};
 },[draft]);
 if(!trip)return null;
 function update(days){const next={...trip,days};setTrip(next);onChange?.(next);setSaved(false);setStatus(t.preview);}
 function save(){try{const valid=normalizeCustomTrip(trip);if(!valid)throw Error();localStorage.setItem(CUSTOM_TRIP_KEY,JSON.stringify(valid));setSaved(true);setStatus(t.saved);window.dispatchEvent(new Event('kth-custom-trip-saved'));track('itinerary_save',{locale,route_id:'custom',storage_type:'local'});}catch{setStatus(t.storageError);}}
 function move(di,si,delta){const days=trip.days.map(d=>({...d,stops:[...d.stops]}));const a=days[di].stops,other=si+delta;if(other<0||other>=a.length)return;const periods=a.map(s=>s.period);[a[si],a[other]]=[a[other],a[si]];days[di].stops=a.map((s,i)=>({...s,period:periods[i]}));update(days);}
 return <section className="custom-trip" data-placement="custom-itinerary" aria-label={c.heading}>
  <small>{c.heading}</small><h3>{trip.title}</h3><p>{trip.summary}</p><p className="custom-trip-note">{c.note}</p>
  <div className="trip-toolbar"><button className="btn" onClick={save}>{saved?'✓ '+t.saved:t.save}</button>{saved&&<a href={`/${locale}/#planner`}>{c.open} →</a>}</div>
  <p role="status">{status}</p><small>{c.storage}</small>
  {trip.days.map((day,di)=>{
   const base=tripBases[day.baseId];return <details key={di} open={di===0} className="custom-trip-day"><summary>{c.day.replace('{n}',di+1)} · {day.theme}</summary>
    <label>{c.base}<select value={day.baseId} onChange={e=>update(trip.days.map((d,i)=>i===di?{...d,baseId:e.target.value,baseReason:c.changedBase,notes:c.changedBase}:d))}>{Object.entries(tripBases).filter(([,b])=>b.city===base.city).map(([id,b])=><option value={id} key={id}>{b.name}</option>)}</select></label>
    <p>{day.baseReason}</p><a className="btn" href={stay22Hotels(baseQuery(day.baseId))} target="_blank" rel="sponsored nofollow noopener noreferrer" data-journey-target="custom-hotel">{c.hotels} ↗</a><small className="cw-affiliate">{affiliateNote}</small>
    {di>0&&trip.days[di-1].baseId!==day.baseId&&<p><a href={mapLeg(baseQuery(trip.days[di-1].baseId),baseQuery(day.baseId))} target="_blank" rel="noopener noreferrer">{c.transfer} ↗</a></p>}
    <ol>{day.stops.map((stop,si)=>{const p=tripPlaces[stop.placeId],name=catalog?.['dest:'+stop.placeId]?.name||p.name;const origin=si?placeQuery(day.stops[si-1].placeId):baseQuery(day.baseId);return <li key={stop.placeId}>
     <strong>{stop.period} · {name}</strong><p>{stop.activity}</p>
     <div className="custom-trip-links"><a href={mapLeg(origin,placeQuery(stop.placeId))} target="_blank" rel="noopener noreferrer">{c.leg} ↗</a><a href={`/${locale}/destinations/${stop.placeId}/`}>{t.details} →</a></div>
     <div className="trip-stop-actions"><button disabled={si===0} aria-label={`${t.moveUp}: ${name}`} onClick={()=>move(di,si,-1)}>↑</button><button disabled={si===day.stops.length-1} aria-label={`${t.moveDown}: ${name}`} onClick={()=>move(di,si,1)}>↓</button><button disabled={day.stops.length===1} aria-label={`${t.removeStop}: ${name}`} onClick={()=>update(trip.days.map((d,i)=>i===di?{...d,stops:d.stops.filter((_,j)=>j!==si)}:d))}>×</button></div>
    </li>})}</ol>
    <a href={mapLeg(placeQuery(day.stops.at(-1).placeId),baseQuery(day.baseId))} target="_blank" rel="noopener noreferrer">{c.return} ↗</a><p>{day.notes}</p>
   </details>;
  })}
 </section>;
}
