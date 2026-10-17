import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {analyticsBootstrap} from '../lib/analytics-bootstrap.mjs';
import {GA_ID,ADS_ID} from '../lib/analytics-config.mjs';
import {eventPayload,affiliatePartner} from '../lib/analytics-policy.mjs';
import worker from '../worker/index.js';

function storage(initial={}){const data=new Map(Object.entries(initial));return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
function boot({search='',hostname='ktriphub.com',consent=null,session=storage(),throws=false}={}){
 const context={URLSearchParams,Date,location:{search,hostname},sessionStorage:session,localStorage:throws?{getItem(){throw Error('blocked')}}:storage({kth_consent:consent})};
 context.window=context;vm.runInNewContext(analyticsBootstrap,context);
 return {...context,commands:(context.dataLayer||[]).map(x=>Array.from(x))};
}
test('default consent precedes measurement; no opt-in is invented',()=>{
 const out=boot();assert.equal(out.commands[0][0],'consent');assert.equal(out.commands[0][1],'default');
 assert.equal(out.commands[0][2].analytics_storage,'denied');
 assert.equal(out.commands[0][2].ad_storage,'denied');
 assert.equal(out.commands.filter(x=>x[0]==='config').length,2);
 for(const consent of [null,'denied'])assert.equal(boot({consent}).commands.some(x=>x[1]==='update'),false);
 assert.equal(boot({consent:'granted'}).commands[1][2].analytics_storage,'granted');
 assert.equal(Object.keys(boot({consent:'granted'}).commands[1][2]).length,1);
 assert.doesNotThrow(()=>boot({throws:true}));
});
test('QA suppresses measurement across pages in the tab, with an explicit reset',()=>{
 const session=storage();
 for(const search of ['?kth_qa=1','']){
  const out=boot({search,session});assert.equal(out.kthAnalyticsDisabled,true);assert.equal(out.commands.length,0);assert.equal(out['ga-disable-'+GA_ID],true);assert.equal(out['ga-disable-'+ADS_ID],true);
 }
 assert.equal(boot({search:'?kth_qa=0',session}).kthAnalyticsDisabled,false);
 assert.equal(boot({search:'?utm_source=internal_qa&utm_medium=test'}).commands.length,0);
 assert.equal(boot({hostname:'localhost'}).commands.length,0);
 assert.equal(boot({search:'?utm_source=chatgpt.com'}).kthAnalyticsDisabled,false);
});
test('custom events respect consent, QA and parameter privacy, and use beacon delivery',()=>{
 let source=fs.readFileSync('lib/analytics.js','utf8').replace(/^import .*;\r?\n/gm,'').replace('export function track','function track');
 const sent=[],context={eventPayload,pageGroup:()=> 'visa-country',GA_ID,window:{gtag:(...a)=>sent.push(a)},location:{hostname:'ktriphub.com',pathname:'/id/visa/indonesia/'},localStorage:storage({kth_consent:'denied'})};
 vm.createContext(context);vm.runInContext(source,context);
 context.track('affiliate_click',{partner:'klook'});assert.equal(sent.length,0);
 context.localStorage.setItem('kth_consent','granted');context.window.kthAnalyticsDisabled=true;context.track('affiliate_click',{partner:'klook'});assert.equal(sent.length,0);
 context.window.kthAnalyticsDisabled=false;context.track('affiliate_click',{partner:'klook',locale:'id',placement:'visa-booking',target:'experiences',email:'private@example.com'});
 assert.equal(sent.length,1);assert.equal(sent[0][2].partner,'klook');assert.equal(sent[0][2].transport_type,'beacon');assert.equal(sent[0][2].email,undefined);
});
test('all operating languages contain complete journey labels and real localized destinations',()=>{
 const copies=JSON.parse(fs.readFileSync('data/visa-journey-ui.json'));
 const locales=[...fs.readFileSync('lib/i18n.js','utf8').match(/export const locales = \[([^\]]+)/)[1].matchAll(/["']([^"']+)["']/g)].map(x=>x[1]);
 assert.deepEqual(Object.keys(copies).sort(),locales.sort());
 for(const l of locales){assert.deepEqual(Object.keys(copies[l]),Object.keys(copies.en));for(const v of Object.values(copies[l]))assert.ok(v.trim());}
 assert.equal(affiliatePartner('https://affiliate.klook.com/redirect?aid=130139'),'klook');
 assert.equal(affiliatePartner('https://www.stay22.com/allez/roam'),'stay22');
 if(process.argv.includes('--export'))for(const l of locales){
  for(const path of ['plan/visa','visa/indonesia']){
   const html=fs.readFileSync('out/'+l+'/'+path+'/index.html','utf8');
   assert.ok(html.includes('data-placement="visa-top"'));assert.ok(html.includes('data-placement="visa-booking"'));
   for(const target of ['itinerary','stay','plan/airport'])assert.ok(html.includes('href="/'+l+'/'+target+'/"'));
   assert.ok(html.includes('data-journey-target="hotels"'));assert.ok(html.includes('sponsored nofollow noopener noreferrer'));
  }
 }
});
test('language redirect preserves ad attribution identifiers without persisting user input',async()=>{
 const qs='?gclid=test-gclid&wbraid=test-web&gbraid=test-app&utm_source=google&utm_medium=cpc';
 const response=await worker.fetch(new Request('https://ktriphub.com/'+qs,{headers:{'Accept-Language':'id'}}),{});
 assert.equal(response.headers.get('Location'),'https://ktriphub.com/id/'+qs);
});
