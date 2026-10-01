import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {tripShareUrl,pageShareUrl,emailShareUrl} from '../lib/share.mjs';
import {decodeTrip} from '../lib/trip-state.mjs';
import {calculateBudget,budgetCurrency} from '../lib/budget.mjs';
import {eventPayload,nextStepTarget} from '../lib/analytics-policy.mjs';
import {resolvePlaces} from '../lib/places-state.mjs';
import {visaSearchMetadata} from '../lib/search-metadata.mjs';
const read = path => JSON.parse(fs.readFileSync(path));
const routes = read('data/itineraries.json').items;
test('shared places survive storage changes and edits without reading or overwriting local selections',()=>{
 const catalog={'dest:bukchon':{},'food:bbq':{}};
 const stored=()=>JSON.stringify(['food:bbq']);
 assert.deepEqual(resolvePlaces('?places=dest:bukchon',stored,catalog),{shared:true,ids:['dest:bukchon']});
 assert.deepEqual(resolvePlaces('?places=',()=>{throw new Error('storage blocked')},catalog),{shared:true,ids:[]});
 assert.deepEqual(resolvePlaces('?places=food:bbq,dest:bukchon',stored,catalog).ids,['food:bbq','dest:bukchon']);
 assert.deepEqual(resolvePlaces('',stored,catalog),{shared:false,ids:['food:bbq']});
});
test('country budgets and next-step analytics identify the chosen tool',()=>{
 assert.equal(budgetCurrency('en','indonesia'),'IDR');assert.equal(budgetCurrency('ko','vietnam'),'VND');assert.equal(budgetCurrency('ko'),'KRW');
 assert.equal(nextStepTarget('https://ktriphub.com/vi/#planner'),'planner');
 assert.equal(nextStepTarget('https://ktriphub.com/id/plan/money/#budget'),'budget');
 assert.equal(nextStepTarget('https://ktriphub.com/id/guides/korea-from-indonesia/'),'korea-from-indonesia');
});
test('search copy is complete and passport descriptions are unique, localized and bounded',()=>{
 const copies=read('data/search-copy.json');const locales=Object.keys(read('data/share-ui.json'));
 const slugs=fs.readdirSync('data/visa').filter(f=>f.endsWith('.json')&&!f.endsWith('.i18n.json')).map(f=>f.replace('.json',''));
 for(const locale of locales){
  assert.deepEqual(Object.keys(copies[locale]).sort(),Object.keys(copies.en).sort());
  const descriptions=new Set();
  for(const slug of slugs){
   const guide=read(`data/visa/${slug}.json`);
   const meta=visaSearchMetadata({...guide,metaTitle:'x'.repeat(71)},slug,locale,copies[locale]);
   assert.ok(meta.title.length<=70,`${locale}/${slug}: title ${meta.title.length}`);
   assert.ok(meta.description.length<=180,`${locale}/${slug}: description ${meta.description.length}`);
   assert.ok(!meta.description.includes('{country}'));assert.ok(!descriptions.has(meta.description));descriptions.add(meta.description);
  }
  for(const value of Object.values(copies[locale]))assert.ok(typeof value==='string'&&value.trim());
 }
});
test('every topic has a shipped image with attribution',()=>{
 const images=read('data/topic-images.json');
 for(const slug of read('data/topics.json').order){assert.ok(images[slug]?.creditUrl,slug);assert.ok(fs.existsSync('public'+images[slug].img),slug);}
});
test('shared trip retains selected route and stop order but never checklist or tracking parameters',()=>{
 const trip={v:1,route:'seoul-3-days',excluded:['2-0'],order:['1-2','1-0','1-1'],checked:['visa']};
 const url=new URL(tripShareUrl({origin:'https://ktriphub.com',locale:'vi',trip,places:['dest:bukchon','food:bbq']}));
 assert.equal(url.pathname,'/vi/');assert.equal(url.hash,'#planner');
 const restored=decodeTrip(url.searchParams.get('trip'),routes);
 assert.deepEqual(restored.excluded,trip.excluded);assert.deepEqual(restored.order,trip.order);assert.deepEqual(restored.checked,[]);
 assert.equal(url.searchParams.get('places'),'dest:bukchon,food:bbq');
 assert.equal(new URL(tripShareUrl({origin:'https://ktriphub.com',locale:'en',trip})).searchParams.get('places'),'');
 assert.equal(pageShareUrl('https://ktriphub.com/vi/plan/money/?email=private&utm_source=test#budget'),'https://ktriphub.com/vi/plan/money/');
});
test('email draft safely encodes multilingual titles and the entire shared URL',()=>{
 const title='여행 & lịch trình? #서울';const link=tripShareUrl({origin:'https://ktriphub.com',locale:'ko',places:['dest:bukchon']});
 const email=new URL(emailShareUrl(title,link));assert.equal(email.protocol,'mailto:');
 assert.equal(email.searchParams.get('subject'),title);assert.equal(email.searchParams.get('body'),`${title}\n\n${link}`);
 assert.equal([...email.searchParams].length,2);
});
test('budget uses only user quotes and positive manual rates; invalid and empty input has no total',()=>{
 assert.deepEqual(calculateBudget(['100000','200000','','25000','0'],'12','IDR'),{total:325000,converted:3900000});
 assert.deepEqual(calculateBudget(['0'],'','KRW'),{total:0,converted:0});
 for(const values of [[''],['-1'],['NaN'],['Infinity'],['1000000000001']])assert.equal(calculateBudget(values,'1','KRW'),null);
 for(const rate of ['','0','-1','Infinity','NaN'])assert.equal(calculateBudget(['100'],rate,'VND'),null);
 assert.equal(calculateBudget(['100'],'1','EVIL'),null);
});
test('new tools have complete localized labels and analytics never collects budgets or share URLs',()=>{
 const locales=[...fs.readFileSync('lib/i18n.js','utf8').match(/export const locales = \[([^\]]+)/)[1].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]);
 for(const file of ['data/share-ui.json','data/budget-ui.json']){const data=read(file);for(const locale of locales){assert.deepEqual(Object.keys(data[locale]).sort(),Object.keys(data.en).sort());for(const value of Object.values(data[locale]))assert.equal(typeof value,'string');}}
 assert.deepEqual(eventPayload('budget_calculate',{locale:'id',currency:'IDR',total:12345,rate:12}),{locale:'id',currency:'IDR'});
 assert.deepEqual(eventPayload('page_share',{locale:'vi',method:'email_open',url:'https://private'}),{locale:'vi',method:'email_open'});
});
