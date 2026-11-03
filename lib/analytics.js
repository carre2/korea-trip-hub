import {eventPayload,pageGroup} from './analytics-policy.mjs';
import {GA_ID} from './analytics-config.mjs';
export function track(name,params={}){
 try{
  if(localStorage.getItem('kth_consent')!=='granted'||typeof window.gtag!=='function')return;
  if(!['ktriphub.com','www.ktriphub.com'].includes(location.hostname))return;
  const payload=eventPayload(name,{page_group:pageGroup(location.pathname),...params});
  // transport_type:'beacon' so events survive the same-tab navigation a clicked
  // internal link triggers (e.g. the NextSteps funnel band) — without it the
  // request is cancelled on unload and the click is never recorded.
  if(payload){window.gtag('event',name,{...payload,send_to:GA_ID,transport_type:'beacon'});return true;}
 }catch{}
}
