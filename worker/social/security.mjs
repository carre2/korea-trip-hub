export async function digest(value) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function validSignature(raw, signature, secret) {
  if (!secret || !/^sha256=[a-f0-9]{64}$/.test(signature || '')) return false;
  const key = await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const bytes = Uint8Array.from(signature.slice(7).match(/../g),h=>parseInt(h,16));
  return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(raw));
}
export function instagramEvents(payload, accountId, username) {
  if (payload?.object !== 'instagram' || !Array.isArray(payload.entry)) return [];
  const events=[];
  for (const entry of payload.entry) {
    if (String(entry.id) !== accountId) continue;
    for (const item of entry.messaging || []) {
      if (!item.message?.mid || !item.message.text || item.message.is_echo || item.message.is_deleted || String(item.recipient?.id) !== accountId || String(item.sender?.id) === accountId) continue;
      events.push({platform:'instagram',kind:'dm',id:String(item.message.mid),author:String(item.sender?.id || ''),account:accountId,text:item.message.text,time:Number(item.timestamp)});
    }
    for (const change of entry.changes || []) {
      const v=change.value;
      if (change.field !== 'comments' || !v?.id || !v.text || !v.from?.id || String(v.from.id) === accountId || v.from.username === username) continue;
      events.push({platform:'instagram',kind:'comment',id:String(v.id),author:String(v.from.id),account:accountId,text:v.text,time:Number(entry.time)*1000});
    }
  }
  return events;
}
export function eligibleEvent(e, env, now=Date.now()) {
  const activation = Date.parse(env.ACTIVATED_AT || '');
  if (!Number.isFinite(activation)) return 'not_activated';
  if (!e.id || !e.author || !e.account || !['instagram','threads'].includes(e.platform)) return 'invalid_event';
  if (e.platform === 'instagram' && e.account !== env.IG_USER_ID) return 'wrong_account';
  if (e.platform === 'threads' && (e.account !== env.THREADS_USER_ID || e.kind !== 'comment')) return 'wrong_account';
  if (!Number.isFinite(e.time) || e.time < activation || e.time > now + 60000 || now-e.time > 3600000) return 'outside_service_window';
  return null;
}
