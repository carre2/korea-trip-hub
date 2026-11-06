import {writeFileSync, mkdirSync, readFileSync} from 'node:fs';
import {draftSocialReply} from '../lib/social-replies.mjs';
const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const examples = [
  ['Instagram 댓글','instagram','comment','Do I need a visa? I have a Vietnamese passport.'],
  ['Instagram DM','instagram','dm','Apakah paspor Indonesia perlu visa?'],
  ['Threads 답글','threads','comment','공항에서 시내로 어떻게 가나요?'],
  ['Threads 답글','threads','comment','Can you send a trip planner guide?'],
  ['감상 댓글','instagram','comment','Nice food photo!'],
  ['직접 확인 필요','instagram','dm','Can you refund my visa fee?'],
];
const config = JSON.parse(readFileSync('marketing/management/auto-replies.json','utf8'));
const cards = examples.map(([channel,platform,kind,text]) => {
  const result = draftSocialReply({text,platform,kind});
  return `<article><header>${escape(channel)} <span>${result.action === 'draft' ? '답변 초안' : '자동 답장 제외'}</span></header><p class="question">${escape(text)}</p><div class="answer">${result.action === 'draft' ? `${escape(result.text).replace(/\n/g,'<br>')}<p><a href="${escape(result.url)}" target="_blank" rel="noopener noreferrer">연결 페이지 확인 ↗</a></p>` : escape(result.reason)}</div></article>`;
}).join('');
const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Korea Trip Hub 문의 자동응답 검토</title><style>*{box-sizing:border-box}body{margin:0;background:#fcf8f5;color:#183b38;font:16px/1.7 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:48px 24px}h1{font-size:clamp(27px,4vw,40px);line-height:1.25}.badge{display:inline-block;background:#f8e3bb;border-radius:30px;padding:7px 15px;font-weight:700}.lead{max-width:850px;color:#415c59}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}article{background:#fff;border:1px solid #dbd8e0;border-radius:22px;padding:22px;box-shadow:0 6px 25px #263c3a08}header{font-weight:750;display:flex;gap:10px;justify-content:space-between}header span{font-size:12px;background:#edf5f0;border-radius:30px;padding:3px 8px}.question{padding:12px;background:#f3eef8;border-radius:14px}.answer{font-size:14px;overflow-wrap:anywhere}a{color:#006b58}.welcome{white-space:pre-wrap;background:#edf5f0;padding:24px;border-radius:18px}footer{margin-top:30px;color:#526966;font-size:14px}</style><main><div class="badge">2026-10-16 · 실제 자동 발송 미가동</div><h1>질문에 맞는 여행 가이드로 연결해요 🌷</h1><p class="lead">@korea_travel_visa_keta 및 연결된 Threads용 초안입니다. 비자 허가 여부를 판단하지 않고, 여권 국적을 언어로 추정하지 않습니다. 아래 링크 열기는 페이지 확인용이며 메시지를 보내지 않습니다.</p><div class="grid">${cards}</div><h2>첫 DM 환영 답장 초안</h2><div class="welcome">${escape(config.instagramWelcome)}</div><footer>Instagram 메시지 접근은 연결 완료. Meta 기본 자동응답 저장 오류 / 공식 API 앱 연결 대기. 중복 차단·응답 제한·실제 수신 및 송신 검증을 마치기 전에는 자동 발송을 활성화하지 않습니다.</footer></main></html>`;
mkdirSync('review/2026-10-16',{recursive:true});
writeFileSync('review/2026-10-16/social-replies-preview.html',html);
console.log('Created review/2026-10-16/social-replies-preview.html (offline preview; sends nothing).');
