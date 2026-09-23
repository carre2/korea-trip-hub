"use client";
import {useState} from 'react';
import {stay22Embed} from '../lib/booking';
import {useExperience} from './ExperienceProvider';
export default function Stay22Map({place,heading}){
 const [open,setOpen]=useState(false),t=useExperience(),src=stay22Embed(place);if(!src)return null;
 return <section className="stay22" aria-label={heading}><h2>🏨 {heading}</h2>{!open?<button type="button" className="btn ghost" onClick={()=>setOpen(true)}>{heading} ↗</button>:<div className="stay22-frame"><iframe src={src} title={heading} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" allow="fullscreen" /></div>}<p className="bookcta-disc">ⓘ {t.affiliate}</p></section>
}
