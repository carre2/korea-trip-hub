"use client";
import {useEffect,useState} from 'react';
import {PLACES_KEY,resolvePlaces} from '../lib/places-state.mjs';
import ShareTools from './ShareTools';
import TravelIcon from './TravelIcon';
import {tripShareUrl} from '../lib/share.mjs';
export default function SavedPlaces({catalog,locale,t}){
 const [ids,setIds]=useState([]),[shared,setShared]=useState(false),[status,setStatus]=useState('');
 useEffect(()=>{
  function sync(event){
   if(event?.type==='storage' && event.key!==null && event.key!==PLACES_KEY)return;
   try{const next=resolvePlaces(location.search,()=>localStorage.getItem(PLACES_KEY),catalog);setIds(next.ids);setShared(next.shared)}catch{setStatus(t.storageError)}
  }
  sync();window.addEventListener('storage',sync);window.addEventListener('places-change',sync);
  return()=>{window.removeEventListener('storage',sync);window.removeEventListener('places-change',sync)}
 },[catalog,t]);
 function save(next){try{localStorage.setItem(PLACES_KEY,JSON.stringify(next));setShared(false);setStatus(t.saved);const u=new URL(location.href);u.searchParams.delete('places');history.replaceState(null,'',u.href);window.dispatchEvent(new Event('places-change'));return true}catch{setStatus(t.storageError);return false}}
 function update(next){setIds(next);if(!shared)save(next);else {const u=new URL(location.href);u.searchParams.set('places',next.join(','));history.replaceState(null,'',u.href);window.dispatchEvent(new Event('places-change'));}}
 function move(i,n){const next=[...ids];[next[i],next[i+n]]=[next[i+n],next[i]];update(next)}
 function shareUrl(){return tripShareUrl({origin:location.origin,locale,places:ids})}
 return <section id="saved-places" className="saved-places"><h3 className="travel-heading"><TravelIcon name="saved"/>{t.savedPlaces}</h3><p>{t.placesHint}</p>{ids.length===0?<p className="saved-empty">{t.placesEmpty}</p>:<><ol>{ids.map((id,i)=>{const p=catalog[id];return <li key={id}><a href={`/${locale}/${p.path}`}>{p.name}</a><div className="saved-place-actions"><button disabled={!i} aria-label={`${t.moveUp}: ${p.name}`} onClick={()=>move(i,-1)}>↑</button><button disabled={i===ids.length-1} aria-label={`${t.moveDown}: ${p.name}`} onClick={()=>move(i,1)}>↓</button><button aria-label={`${t.removeStop}: ${p.name}`} onClick={()=>update(ids.filter(x=>x!==id))}>×</button></div></li>})}</ol><div className="trip-toolbar">{shared&&<button className="btn" onClick={()=>save(ids)}>{t.save}</button>}<button className="trip-text-button" onClick={()=>update([])}>{t.clearPlaces}</button></div><ShareTools locale={locale} title={t.savedPlaces} getUrl={shareUrl} selection /></> }<p role="status">{status}</p><a href={`/${locale}/destinations/`}>{t.explore} →</a></section>
}
