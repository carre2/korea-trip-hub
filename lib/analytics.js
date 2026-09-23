import {eventPayload,pageGroup} from './analytics-policy.mjs';
export function track(name,params={}){
 try{
  if(localStorage.getItem('kth_consent')!=='granted'||typeof window.gtag!=='function')return;
  if(['localhost','127.0.0.1','::1'].includes(location.hostname)||location.hostname.endsWith('.workers.dev'))return;
  const payload=eventPayload(name,{page_group:pageGroup(location.pathname),...params});
  if(payload){window.gtag('event',name,payload);return true;}
 }catch{}
}
