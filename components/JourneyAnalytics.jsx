"use client";
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {officialSource,nextStepTarget,affiliatePartner} from '../lib/analytics-policy.mjs';
import {track} from '../lib/analytics';
export default function JourneyAnalytics({locale}){
 const pathname=usePathname();
 useEffect(()=>{
  function click(e){
   if(e.type==='auxclick'&&e.button!==1)return;
   const a=e.target.closest?.('a[href]');if(!a)return;
   const source=officialSource(a.href);if(source)track('official_source_click',{locale,source_type:source});
   const placement=a.closest('[data-placement]')?.dataset.placement||'article',partner=affiliatePartner(a.href);
   if(partner)track('affiliate_click',{locale,partner,placement,target:a.dataset.journeyTarget||partner});
   if(a.dataset.landingLink)track('landing_link_click',{locale,target:a.dataset.landingLink,placement:'home'});
   if(a.closest('.nextsteps,.visa-journey'))track('next_step_click',{locale,placement,target:a.dataset.journeyTarget||nextStepTarget(a.href)});
  }
  const seen=new WeakSet(),visible=new Set();
  function record(){for(const el of visible)if(!seen.has(el)&&track('next_step_view',{locale,placement:el.dataset.placement||'article'}))seen.add(el)}
  // Observe the heading: a tall section may never be half visible on a phone.
  const observer=new IntersectionObserver(entries=>{for(const e of entries){const section=e.target.closest('[data-placement]')||e.target;if(e.isIntersecting&&e.intersectionRatio>=.5)visible.add(section);else visible.delete(section)}record()},{threshold:.5});
  document.querySelectorAll('.arrival-next,.nextsteps,.visa-journey').forEach(el=>observer.observe(el.querySelector('h2')||el));
  document.addEventListener('click',click);document.addEventListener('auxclick',click);window.addEventListener('kth-consent-change',record);
  return()=>{observer.disconnect();document.removeEventListener('click',click);document.removeEventListener('auxclick',click);window.removeEventListener('kth-consent-change',record)};
 },[locale,pathname]);return null;
}
