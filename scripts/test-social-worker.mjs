import assert from 'node:assert/strict';
import worker, {ReplyInbox} from '../worker/social/index.mjs';
import {instagramEvents, eligibleEvent, validSignature} from '../worker/social/security.mjs';

class Storage {
  data=new Map(); queue=Promise.resolve(); alarmValue=null;
  async get(key) {return this.data.get(key);}
  async put(key,value) {this.data.set(key,structuredClone(value));}
  async list({prefix='',limit=1000,startAfter=''}={}) {return new Map([...this.data].sort(([a],[b])=>a.localeCompare(b)).filter(([k])=>k.startsWith(prefix)&&k>startAfter).slice(0,limit));}
  async delete(keys) {for(const key of Array.isArray(keys)?keys:[keys]) this.data.delete(key);}
  async getAlarm() {return this.alarmValue;}
  async setAlarm(time) {this.alarmValue=time;}
  transaction(fn) {const next=this.queue.then(()=>fn(this));this.queue=next.catch(()=>{});return next;}
}
const now=Date.now();
const base={IG_USER_ID:'178000',ACCOUNT_USERNAME:'korea_travel_visa_keta',DEDUPE_SALT:'test-only-secret',LIVE_SEND:'false',ACTIVATED_AT:new Date(now-60000).toISOString(),IG_API_VERSION:'v25.0'};
const event={platform:'instagram',kind:'comment',account:'178000',id:'comment1',author:'visitor1',text:'airport guide please',time:now};
const payload={object:'instagram',entry:[{id:'178000',time:Math.floor(now/1000),changes:[{field:'comments',value:{id:'comment1',text:event.text,from:{id:'visitor1',username:'traveler'}}}],messaging:[{sender:{id:'visitor2'},recipient:{id:'178000'},timestamp:now,message:{mid:'dm1',text:'visa guide please'}}]}]};
assert.equal(instagramEvents(payload,'178000',base.ACCOUNT_USERNAME).length,2);
assert.equal(instagramEvents(payload,'wrong',base.ACCOUNT_USERNAME).length,0);
const echo=structuredClone(payload);echo.entry[0].messaging[0].message.is_echo=true;
assert.equal(instagramEvents(echo,'178000',base.ACCOUNT_USERNAME).length,1);
assert.equal(eligibleEvent(event,base,now),null);
assert.equal(eligibleEvent({...event,account:'other'},base,now),'wrong_account');
assert.equal(eligibleEvent({...event,time:now-7200000},base,now),'outside_service_window');
assert.equal(eligibleEvent(event,{...base,ACTIVATED_AT:''},now),'not_activated');

const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('secret'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
const signature='sha256='+[...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('payload')))].map(x=>x.toString(16).padStart(2,'0')).join('');
assert.equal(await validSignature('payload',signature,'secret'),true);
assert.equal(await validSignature('tampered',signature,'secret'),false);
assert.equal(await validSignature('payload',signature,''),false);

const storage=new Storage(),inbox=new ReplyInbox({storage},base);
let requests=0;
globalThis.fetch=async()=>{requests++;throw new Error('Unexpected network call in draft mode');};
const drafts=await Promise.all([inbox.process(event),inbox.process(event)]);
assert.deepEqual(drafts.map(x=>x.status).sort(),['draft','skip']);
assert.equal(drafts.find(x=>x.status==='skip').reason,'duplicate');
assert.equal((await inbox.process({...event,id:'comment2'})).reason,'cooldown');
assert.equal(requests,0);
assert.ok(!JSON.stringify([...storage.data]).includes('visitor1'));
assert.ok(!JSON.stringify([...storage.data]).includes('airport guide please'));

const liveStorage=new Storage(),live=new ReplyInbox({storage:liveStorage},{...base,LIVE_SEND:'true',IG_ACCESS_TOKEN:'test-token'});
globalThis.fetch=async(url,init)=>{
  requests++;
  if(requests===1) {
    assert.match(url,/\/178000\/messages$/);
    const body=JSON.parse(init.body); assert.deepEqual(body.recipient,{comment_id:'comment1'});
    assert.match(body.message.text,/ktriphub\.com\/en\/plan\/airport\//);
    assert.match(body.message.text,/utm_medium=dm/);
    return Response.json({message_id:'private1'});
  }
  assert.match(url,/\/comment1\/replies$/);
  const notice=new URLSearchParams(init.body).get('message');
  assert.match(notice,/DM/); assert.ok(!notice.includes('https://'));
  return Response.json({id:'reply1'});
};
assert.equal((await live.process(event)).status,'sent');
assert.equal((await live.process(event)).reason,'duplicate');
assert.equal(requests,2);
globalThis.fetch=async()=>{requests++;throw new Error('timeout');};
assert.equal((await live.process({...event,id:'comment3',author:'visitor3'})).status,'needs_review');
assert.equal(await liveStorage.get('paused'),true);
assert.equal((await live.process({...event,id:'comment4',author:'visitor4'})).reason,'paused');
assert.equal(requests,3);
// Activation must allow a new question from a draft tester, without replaying
// the already processed draft event or weakening live duplicate protection.
const activated=new ReplyInbox({storage},{...base,LIVE_SEND:'true',IG_ACCESS_TOKEN:'test-token'});
globalThis.fetch=async()=>Response.json({id:'activation-reply',message_id:'activation-private'});
assert.equal((await activated.process(event)).reason,'duplicate');
assert.equal((await activated.process({...event,id:'new-after-activation'})).status,'sent');
assert.equal((await activated.process({...event,id:'another-live-question'})).reason,'cooldown');
const questionStorage=new Storage(),questions=new ReplyInbox({storage:questionStorage},{...base,LIVE_SEND:'true',IG_ACCESS_TOKEN:'test-token'});
let questionCalls=0;
globalThis.fetch=async(url,init)=>{questionCalls++;assert.match(url,/\/question\/replies$/);assert.match(new URLSearchParams(init.body).get('message'),/Please DM/);return Response.json({id:'request-dm'});};
assert.equal((await questions.process({...event,id:'question',text:'How do I get from the airport?'})).status,'sent');
assert.equal(questionCalls,1); // No unsolicited private message for an ordinary question.
const partialStorage=new Storage(),partial=new ReplyInbox({storage:partialStorage},{...base,LIVE_SEND:'true',IG_ACCESS_TOKEN:'test-token'});
let partialCalls=0;
globalThis.fetch=async()=>{partialCalls++;if(partialCalls===1)return Response.json({message_id:'already-delivered'});throw new Error('ack timeout');};
assert.equal((await partial.process({...event,id:'partial'})).status,'needs_review');
assert.equal((await partial.process({...event,id:'partial'})).reason,'paused');
assert.equal(partialCalls,2); // Never resend the private reply after an uncertain public acknowledgement.
assert.ok([...partialStorage.data.values()].some(row=>row.privateReplyId==='already-delivered'));
await liveStorage.put('event:expired',{at:now-9*86400000,status:'sent'});
await live.alarm(); assert.equal(await liveStorage.get('event:expired'),undefined);
assert.equal((await worker.fetch(new Request('https://test/admin/status'),base,{})).status,401);
assert.equal((await worker.fetch(new Request('https://test/webhooks/instagram?hub.mode=subscribe&hub.verify_token=correct&hub.challenge=hello'),{...base,WEBHOOK_VERIFY_TOKEN:'correct'},{})).status,200);
assert.equal((await worker.fetch(new Request('https://test/webhooks/instagram',{method:'POST',body:'{}'}),{...base,META_WEBHOOK_APP_SECRET:'secret'},{})).status,403);
// Threads: posts published after deployment are auto-watched, pinned ids must be our
// own, replies are paged until the service window, and one unreadable post is isolated.
const iso=t=>new Date(t).toISOString().replace('Z','+0000');
const tEnv={...base,THREADS_ACCESS_TOKEN:'t',THREADS_USER_ID:'999',THREADS_POST_IDS:'111,555',THREADS_WATCH_DAYS:'30'};
const threadsCalls=[];
globalThis.fetch=async url=>{
  url=String(url); threadsCalls.push(url);
  if(url.includes('/me?')) return Response.json({id:'999',username:'korea_travel_visa_keta'});
  if(url.includes('/me/threads?') && !url.includes('after=')) return Response.json({data:[{id:'333',timestamp:iso(now-3600000)},{id:'222',timestamp:iso(now-86400000)}],paging:{next:'x',cursors:{after:'c1'}}});
  if(url.includes('/me/threads?')) return Response.json({data:[{id:'111',timestamp:iso(now-40*86400000)}]});
  if(url.includes('/333/replies?') && !url.includes('after=')) return Response.json({data:[{id:'r1',username:'guest1',text:'airport guide please',timestamp:iso(now-60000)},{id:'r0',username:'korea_travel_visa_keta',text:'own',timestamp:iso(now-120000)}],paging:{next:'x',cursors:{after:'p2'}}});
  if(url.includes('/333/replies?')) return Response.json({data:[{id:'r2',username:'guest2',text:'visa?',timestamp:iso(now-7200000)}],paging:{next:'x',cursors:{after:'p3'}}});
  if(url.includes('/222/replies?')) return new Response('{}',{status:500});
  if(url.includes('/111/replies?')) return Response.json({data:[]});
  throw new Error('unexpected '+url);
};
const {threadsRoots,pollThreads}=await import('../worker/social/index.mjs');
assert.deepEqual(await threadsRoots(tEnv,now),['333','222','111']); // 555 is not ours; 111 pinned though old.
threadsCalls.length=0;
const posted=[];
const fakeInbox={idFromName:()=>'id',get:()=>({fetch:async(_u,init)=>{posted.push(...JSON.parse(init.body));return Response.json({ok:true});}})};
await assert.rejects(pollThreads({...tEnv,INBOX:fakeInbox},now),/threads_read_failed_1_of_3/);
assert.deepEqual(posted.map(e=>e.id).sort(),['r1','r2']); // own reply dropped; 222 failure did not block 111/333.
assert.ok(!threadsCalls.some(u=>u.includes('after=p3'))); // paging stopped at the service window.
assert.ok(threadsCalls.some(u=>u.includes('/111/replies?')));
console.log('Social worker PASS: signature, account isolation, time window, concurrent duplicates, cooldown, draft no-send, one write, ambiguous-outcome pause, metadata privacy and retention, Threads auto-watch/paging/isolation. All outbound calls mocked.');
