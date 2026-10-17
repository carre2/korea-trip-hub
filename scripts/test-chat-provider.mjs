import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import worker from '../worker/index.js';
import {destinations,parseAssistant,cleanPreferences} from '../lib/travel-assistant.mjs';
import {stayAreas} from '../lib/assistant-stay-context.mjs';
const request=(body={locale:'ko',messages:[{role:'user',content:'서울 3일 일정과 호텔'}]},headers={})=>new Request('https://ktriphub.com/api/chat',{method:'POST',headers:{origin:'https://ktriphub.com','content-type':'application/json',...headers},body:JSON.stringify(body)});
const answer=JSON.stringify({reply:'일정 초안을 열어 편집하세요.',actions:[{id:'plan-seoul-3-days',title:'서울 일정'},{id:'book-seoul',title:'숙박 검색'}]});
const complete=text=>Response.json({status:'completed',output:[{type:'message',role:'assistant',content:[{type:'output_text',text}]}]});
test('structured OpenAI response uses safe server-owned routes and does not store API response',async t=>{
 t.mock.method(globalThis,'fetch',async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');const b=JSON.parse(options.body);assert.equal(b.store,false);assert.equal(b.text.format.strict,true);assert.match(b.instructions,/RESPOND IN: Korean/);return complete(answer)});
 const r=await worker.fetch(request(),{OPENAI_API_KEY:'test-key'});assert.equal(r.status,200);const data=await r.json();assert.equal(data.actions[0].href,'/ko/?trip=1.seoul-3-days.#planner');assert.equal(new URL(data.actions[1].href).hostname,'www.stay22.com');assert.equal(data.actions[1].sponsored,true);
});
test('malicious model destinations cannot become links',()=>{const r=parseAssistant(JSON.stringify({reply:'Hello',actions:[{id:'https://evil.test',title:'Click'},{id:'visa',title:'Visa'},{id:'visa',title:'Again'}]}),'en');assert.equal(r.actions.length,1);assert.equal(r.actions[0].href,'/en/plan/visa/')});
test('survey and confirmation cannot expose premature itinerary or booking actions',()=>{
 for(const stage of ['asking','confirming']){
 const r=parseAssistant(JSON.stringify({reply:'Question',stage,actions:[{id:'plan-seoul-3-days',title:'Plan'},{id:'book-seoul-area-1',title:'Hotel'},{id:'planner',title:'Planner'},{id:'stay-seoul',title:'Area guide'}],suggestions:['Solo','Solo','https://evil.test'],preferences:{destination:'Seoul',secret:'discard'}}),'en');
 assert.deepEqual(r.actions.map(a=>a.id),['stay-seoul']);assert.deepEqual(r.suggestions,['Solo']);assert.equal(r.preferences.secret,undefined);
 }
});
test('area search is site-owned and preference fields are bounded',()=>{
 assert.equal(new URL(destinations['book-seoul-area-1']).searchParams.get('address'),'Hongdae, seoul, South Korea');
 assert.equal(cleanPreferences({lodging:'x'.repeat(400)}).lodging.length,220);
});
test('assistant neighborhood context matches maintained editorial guide',()=>{
 const source=JSON.parse(fs.readFileSync(new URL('../data/stay.json',import.meta.url),'utf8'));
 for(const [city,areas] of Object.entries(stayAreas))assert.deepEqual(areas,source.cities[city].areas.map(({name,best})=>({name,best})));
});
test('all catalog pages exist in the static export',()=>{for(const p of Object.values(destinations))if(!/^(https:|\?|#)/.test(p))assert.ok(fs.existsSync(new URL('../out/en/'+p+'index.html',import.meta.url)),p)});
test('bad origin, oversized body, invalid JSON object and rate limits block API work',async()=>{
 assert.equal((await worker.fetch(request(undefined,{origin:'https://evil.test'}),{})).status,403);
 assert.equal((await worker.fetch(request({messages:[{role:'user',content:'a'.repeat(25000)}]}),{})).status,413);
 assert.equal((await worker.fetch(request(null),{})).status,400);
 assert.equal((await worker.fetch(request(),{CHAT_LIMITER:{limit:async()=>({success:false})}})).status,429);
});
test('invalid primary output uses validated fallback; all failures return generic errors',async t=>{
 t.mock.method(globalThis,'fetch',async()=>complete('not json'));
 const r=await worker.fetch(request(),{OPENAI_API_KEY:'test-key',AI:{run:async()=>({response:answer})}});assert.equal(r.status,200);
 const failed=await worker.fetch(request(),{OPENAI_API_KEY:'secret-not-for-output'});assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{error:'chat_unavailable'});
});
test('root locale redirect and static serving remain intact',async()=>{
 const r=await worker.fetch(new Request('https://ktriphub.com/',{headers:{'Accept-Language':'ko'}}),{});assert.equal(r.status,302);
 const a=await worker.fetch(new Request('https://ktriphub.com/en/'),{ASSETS:{fetch:async()=>new Response('page')}});assert.equal(await a.text(),'page');
});
