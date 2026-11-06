import {draftSocialReply} from '../../lib/social-replies.mjs';
import {digest, validSignature, instagramEvents, eligibleEvent} from './security.mjs';
import {privacyHtml} from './privacy.mjs';
import {requestsPrivateGuide,commentNotice} from './presentation.mjs';

const json = (body,status=200) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const accountStub = env => env.INBOX.get(env.INBOX.idFromName('korea-trip-hub'));
const isAdmin = (request,env) => env.ADMIN_TOKEN && request.headers.get('authorization') === `Bearer ${env.ADMIN_TOKEN}`;

export default {
  async fetch(request,env,ctx) {
    const url=new URL(request.url);
    if (url.pathname === '/privacy') return new Response(privacyHtml,{headers:{'content-type':'text/html; charset=utf-8','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
    if (url.pathname === '/health') return json({service:'korea-trip-hub-replies',mode:env.LIVE_SEND === 'true'?'live_configured':'draft',instagramConfigured:!!env.IG_ACCESS_TOKEN,threadsConfigured:!!env.THREADS_ACCESS_TOKEN});
    if (url.pathname === '/webhooks/instagram') {
      if (request.method === 'GET') {
        if (env.WEBHOOK_VERIFY_TOKEN && url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === env.WEBHOOK_VERIFY_TOKEN) return new Response(url.searchParams.get('hub.challenge') || '',{headers:{'cache-control':'no-store'}});
        return new Response('Forbidden',{status:403});
      }
      if (request.method !== 'POST') return new Response('Method not allowed',{status:405});
      if (!env.DEDUPE_SALT) return json({error:'not_configured'},503);
      // Bound the actual streamed body, including requests without Content-Length.
      const reader=request.body?.getReader(); if (!reader) return json({error:'empty'},400);
      const chunks=[]; let size=0;
      for (;;) { const {value,done}=await reader.read(); if(done) break; size+=value.length; if(size>131072) {await reader.cancel();return json({error:'too_large'},413);} chunks.push(value); }
      const raw=new TextDecoder().decode(new Uint8Array(chunks.flatMap(c=>Array.from(c))));
      if (!await validSignature(raw,request.headers.get('x-hub-signature-256'),env.META_WEBHOOK_APP_SECRET)) return json({error:'signature'},403);
      let payload; try {payload=JSON.parse(raw);} catch {return json({error:'json'},400);}
      const events=instagramEvents(payload,env.IG_USER_ID,env.ACCOUNT_USERNAME);
      // Do not acknowledge delivery until durable processing completed. Meta may retry;
      // the atomic claim in ReplyInbox prevents re-sending an uncertain attempt.
      const response=await accountStub(env).fetch('https://internal/events',{method:'POST',body:JSON.stringify(events)});
      return response.ok ? json({received:true}) : json({error:'storage_unavailable'},503);
    }
    if (url.pathname.startsWith('/admin/')) {
      if (!isAdmin(request,env)) return json({error:'unauthorized'},401);
      if (url.pathname === '/admin/preview' && request.method === 'POST') {
        const body=await request.json(); return json(draftSocialReply(body));
      }
      if (url.pathname === '/admin/status' && request.method === 'GET') return accountStub(env).fetch('https://internal/status');
      if (url.pathname === '/admin/pause' && request.method === 'POST') return accountStub(env).fetch('https://internal/pause',{method:'POST'});
      if (url.pathname === '/admin/resume' && request.method === 'POST') {
        const body=await request.json();
        if(body.acknowledgeUncertainDelivery !== true) return json({error:'review_required'},400);
        return accountStub(env).fetch('https://internal/resume',{method:'POST'});
      }
      return json({error:'not_found'},404);
    }
    return json({error:'not_found'},404);
  },
  async scheduled(event,env,ctx) {
    if (!env.THREADS_ACCESS_TOKEN || !env.THREADS_USER_ID) return;
    ctx.waitUntil(pollThreads(env));
  }
};

async function graph(host,path,token,body,jsonBody=false) {
  const response=await fetch(`${host}/${path}`,{method:body?'POST':'GET',headers:{authorization:`Bearer ${token}`,...(body?{'content-type':jsonBody?'application/json':'application/x-www-form-urlencoded'}:{})},body:body?(jsonBody?JSON.stringify(body):new URLSearchParams(body).toString()):undefined,signal:AbortSignal.timeout(12000)});
  const data=await response.json().catch(()=>({}));
  if (!response.ok || data.error) throw new Error(`meta_${response.status}_${data.error?.code || 'unknown'}`);
  return data;
}

async function deliver(e,draft,env,recordPhase) {
  const {text}=draft;
  if (e.platform === 'instagram') {
    if (!env.IG_ACCESS_TOKEN) throw new Error('instagram_token_missing');
    const host=`https://graph.instagram.com/${env.IG_API_VERSION}`;
    let data;
    if(e.kind === 'dm') {
      data=await graph(host,'me/messages',env.IG_ACCESS_TOKEN,{recipient:{id:e.author},message:{text}},true);
    } else {
      const optedIn=requestsPrivateGuide(e.text);
      if(optedIn) {
        const privateReply=await graph(host,`${env.IG_USER_ID}/messages`,env.IG_ACCESS_TOKEN,{recipient:{comment_id:e.id},message:{text}},true);
        if(!privateReply.message_id) throw new Error('missing_private_receipt');
        await recordPhase({privateReplyId:privateReply.message_id,phase:'private_reply_sent'});
      }
      // Never claim a DM was sent before Meta returns its message receipt.
      data=await graph(host,`${encodeURIComponent(e.id)}/replies`,env.IG_ACCESS_TOKEN,{message:commentNotice(draft.locale,optedIn)});
    }
    const id=data.message_id || data.id; if(!id) throw new Error('missing_receipt'); return id;
  }
  if (!env.THREADS_ACCESS_TOKEN) throw new Error('threads_token_missing');
  const host='https://graph.threads.net/v1.0';
  const container=await graph(host,'me/threads',env.THREADS_ACCESS_TOKEN,{media_type:'TEXT',text,reply_to_id:e.id});
  if(!container.id) throw new Error('missing_container');
  await recordPhase({containerId:container.id,phase:'publish_pending'});
  const data=await graph(host,'me/threads_publish',env.THREADS_ACCESS_TOKEN,{creation_id:container.id});
  if(!data.id) throw new Error('missing_receipt'); return data.id;
}

// One durable object serializes event reservation. All duplicate/cooldown checks
// happen atomically BEFORE the network write. No message body is persisted.
export class ReplyInbox {
  constructor(state,env) {this.state=state;this.env=env;}
  async fetch(request) {
    const path=new URL(request.url).pathname;
    if(path === '/pause') {await this.state.storage.put('paused',true); return json({paused:true});}
    if(path === '/resume') {await this.state.storage.delete('paused');return json({paused:false});}
    if(path === '/status') {
      const rows=await this.state.storage.list({prefix:'event:',limit:1000});
      const counts={},byPlatform={},byTopic={}; let lastProcessedAt=null,lastDelivery=null;
      for(const row of rows.values()) {
        counts[row.status]=(counts[row.status]||0)+1;
        byPlatform[row.platform]=(byPlatform[row.platform]||0)+1;
        byTopic[row.topic]=(byTopic[row.topic]||0)+1;
        if(row.at && (!lastProcessedAt || row.at>lastProcessedAt)) lastProcessedAt=row.at;
        if(row.status==='sent' && (!lastDelivery || row.at>lastDelivery.at)) lastDelivery={platform:row.platform,kind:row.kind||null,at:row.at,remoteId:row.remoteId};
      }
      return json({paused:!!await this.state.storage.get('paused'),counts,byPlatform,byTopic,lastProcessedAt,lastDelivery,retentionDays:7,live:this.env.LIVE_SEND === 'true'});
    }
    if(path !== '/events' || request.method !== 'POST') return json({error:'not_found'},404);
    const events=await request.json(); if(!Array.isArray(events)||events.length>100) return json({error:'events'},400);
    const outcomes=[]; for(const e of events) outcomes.push(await this.process(e));
    if (!await this.state.storage.getAlarm()) await this.state.storage.setAlarm(Date.now()+3600000);
    return json({outcomes});
  }
  async alarm() {
    let startAfter;
    for (;;) {
      const rows=await this.state.storage.list({limit:500,...(startAfter?{startAfter}:{})});
      if(!rows.size) break;
      // Remove after six days on a daily alarm, so metadata stays at most seven days.
      const expired=[...rows].filter(([key,value])=>key!=='paused' && value?.at && value.at<Date.now()-6*86400000).map(([key])=>key);
      if(expired.length) await this.state.storage.delete(expired);
      startAfter=[...rows.keys()].at(-1);
      if(rows.size<500) break;
    }
    await this.state.storage.setAlarm(Date.now()+86400000);
  }
  async process(e) {
    const now=Date.now(), reject=eligibleEvent(e,this.env,now);
    if(reject) return {status:'skip',reason:reject};
    const guideByDm=e.platform==='instagram'&&e.kind==='comment'&&requestsPrivateGuide(e.text);
    const draft=draftSocialReply({text:e.text,platform:e.platform,kind:guideByDm?'dm':e.kind,own:e.author === e.account});
    if(draft.action !== 'draft') return {status:'skip',reason:draft.reason};
    const eventKey=`event:${await digest(`${e.platform}:${e.kind}:${e.account}:${e.id}`)}`;
    // Draft previews must not consume the live person's cooldown or send quota.
    // The event key stays shared, so a reviewed draft is never replayed on activation.
    const mode=this.env.LIVE_SEND === 'true'?'live':'draft';
    const presentation=e.platform==='instagram'&&e.kind==='comment'?'private-guide-v1':'standard';
    const personKey=`person:${mode}:${presentation}:${await digest(`${this.env.DEDUPE_SALT}:${e.platform}:${e.author}:${draft.topic}`)}`;
    const hourKey=`hour:${mode}:${e.platform}:${new Date(now).toISOString().slice(0,13)}`;
    const result=await this.state.storage.transaction(async tx=>{
      if(await tx.get('paused')) return 'paused';
      if(await tx.get(eventKey)) return 'duplicate';
      const previous=await tx.get(personKey); if(previous && now-previous.at<86400000) return 'cooldown';
      const hour=await tx.get(hourKey); if((hour?.count || 0)>=10) return 'service_rate_limit';
      await tx.put(eventKey,{status:this.env.LIVE_SEND === 'true'?'reserved':'draft',at:now,topic:draft.topic,locale:draft.locale,platform:e.platform,kind:e.kind});
      await tx.put(personKey,{at:now}); await tx.put(hourKey,{at:now,count:(hour?.count||0)+1});
      return 'reserved';
    });
    if(result !== 'reserved') return {status:'skip',reason:result};
    if(this.env.LIVE_SEND !== 'true') return {status:'draft'};
    // Read the kill switch again immediately before an outbound call.
    if(await this.state.storage.get('paused')) {await this.update(eventKey,{status:'cancelled'});return {status:'cancelled'};}
    try {
      const remoteId=await deliver(e,draft,this.env,phase=>this.update(eventKey,phase));
      await this.update(eventKey,{status:'sent',remoteId}); return {status:'sent'};
    } catch(error) {
      // Timeouts can mean Meta accepted a write. Never retry automatically.
      await this.update(eventKey,{status:'needs_review',error:String(error.message).slice(0,80)});
      await this.state.storage.put('paused',true);
      return {status:'needs_review'};
    }
  }
  async update(key,patch) {const row=await this.state.storage.get(key);await this.state.storage.put(key,{...row,...patch});}
}

const THREADS_HOST='https://graph.threads.net/v1.0';
const MAX_ROOTS=25, MAX_PAGES=5, SERVICE_WINDOW_MS=3600000;

// Watch roots = the account's own recent top-level posts (auto-registered, so posts
// published after deployment are covered) plus any pinned THREADS_POST_IDS that the
// API confirms are ours. Never search other people's posts for promotional chances.
export async function threadsRoots(env,now=Date.now()) {
  const days=Number(env.THREADS_WATCH_DAYS)>0?Number(env.THREADS_WATCH_DAYS):30;
  const own=[]; let after='';
  for(let page=0; page<MAX_PAGES; page++) {
    const data=await graph(THREADS_HOST,`me/threads?fields=id,timestamp&limit=100${after?`&after=${encodeURIComponent(after)}`:''}`,env.THREADS_ACCESS_TOKEN);
    const rows=data.data||[]; own.push(...rows);
    const oldest=Date.parse(rows.at(-1)?.timestamp||'');
    after=data.paging?.next?data.paging?.cursors?.after:'';
    if(!after || !rows.length || oldest<now-days*86400000) break;
  }
  const ownIds=new Set(own.map(x=>String(x.id)));
  const recent=own.filter(x=>Date.parse(x.timestamp)>=now-days*86400000).sort((a,b)=>Date.parse(b.timestamp)-Date.parse(a.timestamp)).map(x=>String(x.id));
  const pinned=(env.THREADS_POST_IDS||'').split(',').map(x=>x.trim()).filter(x=>/^\d+$/.test(x)&&ownIds.has(x));
  return [...new Set([...recent,...pinned])].slice(0,MAX_ROOTS);
}

// Top-level replies only, newest first. Stop paging once a page reaches replies older
// than the service window: older events would be rejected by eligibleEvent anyway.
// Nested replies (people answering each other) are deliberately not auto-answered.
export async function threadsReplies(root,env,now=Date.now()) {
  const out=[]; let after='';
  for(let page=0; page<MAX_PAGES; page++) {
    const data=await graph(THREADS_HOST,`${root}/replies?fields=id,text,timestamp,username&reverse=true&limit=100${after?`&after=${encodeURIComponent(after)}`:''}`,env.THREADS_ACCESS_TOKEN);
    const rows=data.data||[]; out.push(...rows);
    const oldest=Math.min(...rows.map(x=>Date.parse(x.timestamp)).filter(Number.isFinite));
    after=data.paging?.next?data.paging?.cursors?.after:'';
    if(!after || !rows.length || oldest<now-SERVICE_WINDOW_MS) break;
  }
  return out.filter(x=>x.username && x.username!==env.ACCOUNT_USERNAME && x.text).map(x=>({platform:'threads',kind:'comment',account:env.THREADS_USER_ID,id:String(x.id),author:x.username,text:x.text,time:Date.parse(x.timestamp)}));
}

export async function pollThreads(env,now=Date.now()) {
  const me=await graph(THREADS_HOST,'me?fields=id,username',env.THREADS_ACCESS_TOKEN);
  if(String(me.id)!==env.THREADS_USER_ID || me.username!==env.ACCOUNT_USERNAME) throw new Error('threads_account_mismatch');
  const roots=await threadsRoots(env,now);
  const failures=[];
  for(const root of roots) {
    // One unreadable post must not stop the others from being checked.
    let events; try {events=await threadsReplies(root,env,now);} catch(error) {failures.push(String(error.message).slice(0,40)); continue;}
    if(!events.length) continue;
    const response=await accountStub(env).fetch('https://internal/events',{method:'POST',body:JSON.stringify(events)});
    if(!response.ok) throw new Error('threads_storage_failed');
  }
  if(failures.length) throw new Error(`threads_read_failed_${failures.length}_of_${roots.length}:${failures[0]}`);
  return {roots:roots.length};
}
