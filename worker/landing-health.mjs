import {ENTRY_LOCALES} from '../lib/entry-language.mjs';

// Operational response counters only: no IP, UA, cookie, click ID, referrer,
// arbitrary campaign name, full URL or per-person identifier is written.
export function landingContext(request){
 const url=new URL(request.url),q=url.searchParams;
 if(!['ktriphub.com','www.ktriphub.com'].includes(url.hostname)||request.method!=='GET')return null;
 if(q.get('kth_qa')==='1'||q.get('utm_source')==='internal_qa')return null;
 if(request.headers.get('RSC')==='1'||/prefetch/i.test(request.headers.get('Purpose')||request.headers.get('Sec-Purpose')||''))return null;
 const hasClick=['gclid','wbraid','gbraid'].some(key=>q.has(key)&&q.get(key).length>0);
 const hasUtm=q.get('utm_source')==='google'&&q.get('utm_medium')==='cpc';
 if(!hasClick&&!hasUtm)return null;
 const parts=url.pathname.split('/').filter(Boolean);
 if(!ENTRY_LOCALES.includes(parts[0])||parts.some(p=>p.includes('.'))||parts[1]==='api')return null;
 const group=parts[1]==='plan'?(parts[2]==='visa'?'visa-hub':'plan'):parts[1]==='visa'?'visa-country':['itinerary','stay','guides','destinations','food','festivals','kpop'].includes(parts[1])?parts[1]:parts.length===1?'home':'other';
 return {locale:parts[0],group,kind:hasClick?'click-id':'utm',mode:q.get('kth_measurement_probe')==='1'?'probe':'live'};
}

export function recordLanding(request,response,env,elapsed){
 const info=landingContext(request);
 if(!info||!env.LANDING_HEALTH)return false;
 if(response.status>=300&&response.status<400)return false; // count the final HTML, not both redirect hops
 if(response.status<400&&!/text\/html/i.test(response.headers.get('Content-Type')||''))return false;
 const country=/^[A-Z]{2}$/.test(request.cf?.country||'')?request.cf.country:'XX';
 const status=response.status>=500?'5xx':response.status>=400?'4xx':'2xx';
 const speed=elapsed<500?'under-500ms':elapsed<1500?'500-1500ms':'over-1500ms';
 try{
  env.LANDING_HEALTH.writeDataPoint({indexes:['ad-landing-v1'],blobs:[info.mode,info.kind,info.locale,info.group,country,status,speed],doubles:[1]});
  return true; // queued in the runtime, not a claim that a person saw the page
 }catch{return false;} // diagnostics must never break the site
}
