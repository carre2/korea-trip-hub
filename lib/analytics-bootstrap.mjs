import {GA_ID, ADS_ID} from './analytics-config.mjs';
// A plain inline head script: neither consent nor tag loading waits for React.
// QA exclusion is explicit and tab-local. No ad click IDs are persisted here.
export const analyticsBootstrap = `
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
(function(){
 var q=new URLSearchParams(location.search),qa=false;
 try{
  if(q.get('kth_qa')==='0')sessionStorage.removeItem('kth_qa');
  else if(q.get('kth_qa')==='1'||(q.get('utm_source')==='internal_qa'&&q.get('utm_medium')==='test'))sessionStorage.setItem('kth_qa','1');
  qa=sessionStorage.getItem('kth_qa')==='1';
 }catch(e){}
 qa=qa||q.get('kth_qa')==='1'||(q.get('utm_source')==='internal_qa'&&q.get('utm_medium')==='test');
 window.kthAnalyticsDisabled=qa||!['ktriphub.com','www.ktriphub.com'].includes(location.hostname);
 if(window.kthAnalyticsDisabled){window['ga-disable-${GA_ID}']=true;window['ga-disable-${ADS_ID}']=true;return;}
 gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
 window.kthAnalyticsConsent='unset';
 try{var saved=localStorage.getItem('kth_consent');if(saved==='granted'||saved==='denied')window.kthAnalyticsConsent=saved;}catch(e){}
 if(window.kthAnalyticsConsent==='granted')gtag('consent','update',{analytics_storage:'granted'});
 gtag('js',new Date());
 gtag('config','${GA_ID}');gtag('config','${ADS_ID}');
 if(typeof document!=='undefined'&&!document.getElementById('kth-google-tag')){
  var script=document.createElement('script');script.id='kth-google-tag';script.async=true;
  script.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';
  document.documentElement.dataset.kthTagState='loading';
  script.onload=function(){document.documentElement.dataset.kthTagState='loaded';};
  script.onerror=function(){document.documentElement.dataset.kthTagState='unavailable';};
  document.head.appendChild(script);
 }
})();`;
