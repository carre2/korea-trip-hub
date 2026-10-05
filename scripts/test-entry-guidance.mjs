import fs from 'node:fs';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const locales=['en','zh','zh-TW','ja','vi','th','id','es','ms','ko','ru','fr'];
const routing=read('data/entry-routing-ui.json');
const entry=read('data/entry-guidance.json');
const countries=fs.readdirSync('data/visa').filter(x=>x.endsWith('.json')&&!x.includes('.i18n.')).map(x=>x.slice(0,-5));
// Official K-ETA eligible-country list, checked 2026-10-05:
// https://www.k-eta.go.kr/portal/guide/viewetaalification.do
const eligible=new Set(['usa','japan','uk','canada','australia','taiwan','hongkong','singapore','malaysia','thailand','kazakhstan']);
test('all country verdicts match the official ordinary-passport K-ETA eligibility split',()=>{
 assert.equal(countries.length,22);
 for(const code of countries)assert.equal(read(`data/visa/${code}.json`).verdict.need,!eligible.has(code),code);
});
test('K-ETA-required nationality FAQ answers include the age exemption qualification',()=>{
 for(const country of ['thailand','malaysia','kazakhstan']){
  const b=read(`data/visa/${country}.json`),ov=read(`data/visa/${country}.i18n.json`);
  const index=b.faq.items.findIndex(x=>x.q==='Do I need K-ETA?');
  for(const l of locales)assert.ok((l==='en'?b:ov[l]).faq.items[index].a.includes(entry[l].age),`${l}/${country}: omitted age exception`);
 }
});
test('routing copy and Indonesia official policy retain distinctions in every locale',()=>{
 const base=read('data/visa/indonesia.json'),ov=read('data/visa/indonesia.i18n.json');
 for(const locale of locales){
  for(const key of Object.keys(routing.en))assert.ok(routing[locale][key]?.trim(),`${locale}.${key}`);
  const g=locale==='en'?base:ov[locale],body=JSON.stringify(g);
  for(const value of ['2026-12-31','15','24','36','920,000','1,770,000'])assert.ok(body.includes(value),`${locale}: ${value}`);
  assert.equal(g.faq.items.find(x=>x.q==='K-ETA?').factId,'keta-visa-distinction');
  assert.equal(g.applicationOffice.factId,'kvac-jakarta-location');
  assert.ok(!body.includes('lmiconsultancy.com'));
 }
});
if(process.argv.includes('--export'))test('all 264 exported country pages and 12 hubs show the correct scoped guidance',()=>{
 for(const locale of locales){
  for(const country of countries){
   const html=fs.readFileSync(`out/${locale}/visa/${country}/index.html`,'utf8');
   if(eligible.has(country))assert.ok(!html.includes('entry-visa-required'),`${locale}/${country}: wrong visa branch`);
   else {
    assert.ok(html.includes(country==='vietnam'?'vcg-entry-answer':'entry-visa-required'),`${locale}/${country}: missing visa answer`);
    if(country!=='vietnam'){
     const answer=html.match(/<section class="entry-guidance entry-visa-required">([\s\S]*?)<\/section>/)?.[1];
     assert.ok(answer,`${locale}/${country}: required notice`);
     assert.ok(!answer.includes('<details')&&!answer.includes('10,000')&&!answer.includes('65'),`${locale}/${country}: visa-free rules leaked into required notice`);
    }
   }
   if(country==='indonesia')for(const text of ['5F-05A','920,000','1,770,000','2026-12-31'])assert.ok(html.includes(text),`${locale}: ${text}`);
  }
  const hub=fs.readFileSync(`out/${locale}/plan/visa/index.html`,'utf8');
  for(const code of countries)assert.ok(hub.includes(`/${locale}/visa/${code}/`),`${locale}: missing ${code}`);
  assert.ok(hub.includes('<details class="entry-keta-only"><summary>'),`${locale}: K-ETA rules must start collapsed`);
 }
});
