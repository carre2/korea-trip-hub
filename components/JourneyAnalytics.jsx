"use client";
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {officialSource} from '../lib/analytics-policy.mjs';
import {track} from '../lib/analytics';
export default function JourneyAnalytics({locale}){
 const pathname=usePathname();
 useEffect(()=>{
  function click(e){const a=e.target.closest?.('a[href]');if(!a)return;const source=officialSource(a.href);if(source)track('official_source_click',{locale,source_type:source});if(a.closest('.nextsteps'))track('next_step_click',{locale,placement:'bottom',target:new URL(a.href).pathname.split('/').filter(Boolean).at(-1)})}
  const seen=new WeakSet();const visible=new Set();
  function record(){for(const el of visible)if(!seen.has(el)&&track('next_step_view',{locale,placement:el.dataset.placement||'article'}))seen.add(el)}
  const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&e.intersectionRatio>=.5)visible.add(e.target);else visible.delete(e.target)}record()},{threshold:.5});
  document.querySelectorAll('.arrival-next,.nextsteps').forEach(e=>observer.observe(e));document.addEventListener('click',click);window.addEventListener('kth-consent-change',record);
  return()=>{observer.disconnect();document.removeEventListener('click',click);window.removeEventListener('kth-consent-change',record)};
 },[locale,pathname]);return null;
}
