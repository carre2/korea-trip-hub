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

test('K-ETA exceptions are consistent from verdict to document checklist in every language',()=>{
 const facts=read('data/facts.json').facts;
 for(const country of ['thailand','malaysia','kazakhstan']){
  const base=read(`data/visa/${country}.json`),ov=read(`data/visa/${country}.i18n.json`);
  const fact=facts.find(x=>x.id===base.factId);
  assert.equal(fact.value.keta,'required unless exempt');
  assert.ok(fact.value.keta_valid.includes('passport expiry'));
  for(const l of locales){
   const g=l==='en'?base:ov[l];
   for(const text of [g.verdict.sub,g.tldr[1],g.highlights[1].body,g.steps.items[1].detail,g.documents.rows[1].how])
    assert.ok(text.includes(entry[l].age),`${l}/${country}: missing exemption in primary guidance`);
   assert.equal(g.documents.rows[1].req,'conditional');
   assert.ok(g.steps.items[1].detail.includes(entry[l].processing));
   assert.ok(g.documents.rows[2].how.includes(entry[l].arrival));
   assert.ok(g.factValueLabels[fact.value.stay]);
   if(country==='malaysia')assert.ok(!JSON.stringify(g).includes('90'),`${l}: obsolete Malaysia 90-day claim`);
  }
 }
 assert.equal(facts.find(x=>x.id==='visa-malaysia-free').value.stay,'up to 3 months');
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

test('Indonesia tourist submission and checklist preserve official category boundaries',()=>{
 const base=read('data/visa/indonesia.json'),ov=read('data/visa/indonesia.i18n.json');
 const facts=read('data/facts.json').facts;
 for(const id of ['visa-indonesia-submission','visa-indonesia-payment','visa-indonesia-documents','kvac-jakarta-hours'])
  assert.equal(facts.find(x=>x.id===id)?.status,'VERIFIED',id);
 for(const l of locales){
  const g=l==='en'?base:ov[l];
  assert.equal(g.faq.items[3].factId,'visa-indonesia-submission');
  assert.equal(g.steps.items[3].link,'https://www.visaforkorea-in.com/id-ID/customer/faq');
  assert.equal(g.documents.factId,'visa-indonesia-documents');
  assert.equal(g.documents.rows[3].req,'conditional',`${l}: financial evidence can have alternatives`);
  assert.equal(g.documents.rows[4].req,'conditional',`${l}: employment proof must depend on applicant category`);
  assert.equal(g.documents.rows[5].req,'required');
  assert.ok(g.documents.rows[5].how.includes('Kartu Keluarga'),`${l}: missing family card`);
  assert.ok(g.documents.rows[2].how.includes('3.5')&&g.documents.rows[2].how.includes('4.5'));
  assert.ok(g.faq.items.find(x=>x.factId==='visa-indonesia-payment').a.includes('QRIS'));
  const hours=g.faq.items.find(x=>x.factId==='kvac-jakarta-hours').a;
  for(const h of ['09:00','15:00','12:00','17:00','WIB'])assert.ok(hours.includes(h),`${l}: ${h}`);
 }
 assert.ok(!base.steps.items[3].detail.includes('Embassy or'));
});

test('temporary K-ETA waiver guides preserve conditional arrival declarations',()=>{
 for(const country of ['japan','usa','uk','canada','australia','taiwan','hongkong','singapore']){
  const b=read(`data/visa/${country}.json`),ov=read(`data/visa/${country}.i18n.json`);
  for(const l of locales){
   const g=l==='en'?b:ov[l];
   assert.equal(g.documents.rows[1].req,'conditional',`${l}/${country}`);
   assert.ok(g.steps.items[1].detail.includes(entry[l].arrival));
   assert.ok(g.steps.items[0].detail.includes('2026-12-31'));
   assert.ok(g.documents.rows[1].how.includes('72'));
   assert.ok(g.documents.rows[1].how.includes('3'));
  }
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
