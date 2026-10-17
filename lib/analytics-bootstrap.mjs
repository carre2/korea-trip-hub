import {GA_ID, ADS_ID} from './analytics-config.mjs';
// Initialize before hydration. QA exclusion is explicit and tab-local.
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
 try{if(localStorage.getItem('kth_consent')==='granted')gtag('consent','update',{analytics_storage:'granted'});}catch(e){}
 gtag('js',new Date());
 gtag('config','${GA_ID}');gtag('config','${ADS_ID}');
})();`;
