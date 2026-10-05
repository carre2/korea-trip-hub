import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {koreaDay,eventStatus,filterEvents,eventCalendar,eventShareUrl} from '../lib/festivals.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const facts=read('data/facts.json').facts,registry=read('data/festivals.json').items,copies=read('data/festivals-ui.json');
const events=registry.map(e=>({...e,...facts.find(f=>f.id===e.factId).value,verified:'2026-10-05',source: facts.find(f=>f.id===e.factId).source}));
test('event ranges overlap travel dates and statuses use inclusive Korea dates',()=>{
  assert.equal(koreaDay(new Date('2026-10-05T15:01:00Z')),'2026-10-06');
  const b=events.find(e=>e.id==='biff-2026');
  assert.equal(eventStatus(b,'2026-10-05'),'upcoming');assert.equal(eventStatus(b,'2026-10-15'),'ongoing');assert.equal(eventStatus(b,'2026-10-16'),'ended');
  assert.deepEqual(filterEvents(events,{today:'2026-10-05',from:'2026-10-10',until:'2026-10-10'}).map(e=>e.id),['jinju-lanterns-2026','biff-2026']);
  assert.equal(filterEvents(events,{today:'2026-10-05',city:'busan',type:'festival'}).length,1);
  assert.equal(filterEvents(events,{today:'2026-10-19'}).length,1);
  assert.equal(filterEvents(events,{today:'2026-10-19',ended:true}).length,3);
  assert.equal(filterEvents(events,{today:'2026-10-05',from:'2026-11-10',until:'2026-11-01'}).length,0);
});
test('calendar dates are all-day with exclusive end, safe escaping and UTF-8 folding',()=>{
  const b=events.find(e=>e.id==='busan-fireworks-2026');
  const text=eventCalendar(b,'부산불꽃축제'.repeat(20)+';test\nBEGIN:VEVENT','Busan, Korea',eventShareUrl('ko',b.id));
  assert.ok(text.includes('DTSTART;VALUE=DATE:20261107\r\nDTEND;VALUE=DATE:20261108'));
  assert.ok(text.includes('LOCATION:Busan\\, Korea'));
  assert.equal(text.split('\r\n').filter(line=>line==='BEGIN:VEVENT').length,1);
  for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
  assert.equal(eventCalendar(events[0],'BIFF','Busan','https://ktriphub.com/en/festivals/').includes('DTEND;VALUE=DATE:20261016'),true);
});
test('every active locale has complete festival UI, metadata and event translations',()=>{
  const locales=[...fs.readFileSync('lib/i18n.js','utf8').match(/export const locales = \[([^\]]+)/)[1].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]);
  function compare(a,b,path){if(typeof a==='string'){assert.ok(typeof b==='string'&&b.trim(),path);assert.deepEqual(a.match(/\{\w+\}/g)||[],b.match(/\{\w+\}/g)||[],path);}else{assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),path);for(const k of Object.keys(a))compare(a[k],b[k],path+'.'+k);}}
  assert.deepEqual(Object.keys(copies).sort(),locales.sort());
  for(const l of locales){compare(copies.en,copies[l],l);for(const item of registry)assert.ok(copies[l].events[item.id]);}
});
test('all published festival entries reference verified official facts with review dates',()=>{
  assert.equal(new Set(registry.map(e=>e.id)).size,registry.length);
  for(const e of registry){const f=facts.find(f=>f.id===e.factId);assert.equal(f.status,'VERIFIED');assert.equal(f.tier,'VOLATILE');assert.ok(f.verified&&f.recheck_after&&f.source_name);assert.match(f.source,/^https:\/\//);assert.ok(f.value.start<=f.value.end);assert.match(f.claim,new RegExp(f.value.start));assert.match(f.claim,new RegExp(f.value.end));}
});

test('festival partner products have verified Klook identity and complete localized labels',()=>{
  const ui=read('data/booking-ui.json');
  assert.deepEqual(Object.keys(ui).sort(),Object.keys(copies).sort());
  for(const [locale,t] of Object.entries(ui)){
    assert.deepEqual(Object.keys(t).sort(),Object.keys(ui.en).sort());
    for(const value of Object.values(t))assert.ok(typeof value==='string'&&value.trim(),locale);
  }
  for(const item of registry){
    assert.ok(item.klookSearch);
    if(!item.bookingFactId)continue;
    const f=facts.find(f=>f.id===item.bookingFactId);
    assert.equal(f.status,'VERIFIED');assert.equal(f.tier,'VOLATILE');
    assert.equal(new URL(f.value.url).hostname,'www.klook.com');
    assert.equal(f.source,f.value.url);assert.ok(f.verified<=f.recheck_after);
    assert.ok(['tickets','tour'].includes(f.value.kind));
  }
});

test('partner routes retain real tracking IDs and encode destination queries safely',async()=>{
  const code=fs.readFileSync('lib/booking.js','utf8');
  const booking=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
  const destination='https://www.klook.com/en-US/activity/171795-2026-busan-fireworks-festival-21th-anniversary-ticket/';
  const klook=new URL(booking.klookUrl(destination));
  assert.equal(klook.hostname,'affiliate.klook.com');
  assert.equal(klook.searchParams.get('aid'),booking.KLOOK.aid);
  assert.equal(klook.searchParams.get('aff_adid'),booking.KLOOK.adid);
  assert.equal(klook.searchParams.get('k_site'),destination);
  const place='Busan & Jinju, South Korea';
  for(const url of [booking.stay22Hotels(place),booking.stay22Embed(place)]){
    const u=new URL(url);assert.equal(u.hostname,'www.stay22.com');
    assert.equal(u.searchParams.get('aid'),booking.STAY22.aid);
    assert.equal(u.searchParams.get('address'),place);
    assert.equal(u.searchParams.has('checkin'),false);
  }
});
