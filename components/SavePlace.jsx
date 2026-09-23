"use client";
import {useEffect,useState} from 'react';
import {useExperience} from './ExperienceProvider';
import {PLACES_KEY} from '../lib/places-state.mjs';
import {track} from '../lib/analytics';
export default function SavePlace({id,locale}){
 const t=useExperience(),[saved,setSaved]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{function sync(){try{const p=JSON.parse(localStorage.getItem(PLACES_KEY)||'[]');setSaved(Array.isArray(p)&&p.includes(id));}catch{}}sync();window.addEventListener('places-change',sync);window.addEventListener('storage',sync);return()=>{window.removeEventListener('places-change',sync);window.removeEventListener('storage',sync)}},[id]);
 function toggle(){try{const raw=JSON.parse(localStorage.getItem(PLACES_KEY)||'[]');const p=Array.isArray(raw)?raw.filter(x=>typeof x==='string'):[];if(!saved&&p.length>=80){setError(true);return}localStorage.setItem(PLACES_KEY,JSON.stringify(saved?p.filter(x=>x!==id):[...new Set([...p,id])]));setSaved(!saved);setError(false);window.dispatchEvent(new Event('places-change'));track('place_save',{locale,target:id,action:saved?'remove':'add'});}catch{setError(true)}}
 return <div className="save-place"><button className="btn ghost" type="button" aria-pressed={saved} onClick={toggle}>{saved?'✓ '+t.placeSaved:'+ '+t.addPlace}</button><a href={`/${locale}/#saved-places`}>{t.myTrip} →</a>{error&&<p role="status">{t.storageError}</p>}</div>
}
