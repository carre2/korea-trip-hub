const fs=require('fs'),assert=require('node:assert/strict');const r='C:/Users/user/Documents/Codex/korea-trip-hub';
const locales=['en','vi','ko','ja','zh','zh-TW','id','ms','th','es','fr','ru'];
for(const loc of locales){const html=fs.readFileSync(r+'/out/'+loc+'/visa/vietnam/index.html','utf8');const guide=html.split('class="gv"')[1]?.split('vcg-hero')[0]||html;
assert(html.includes('vcg-entry-answer'),loc+' missing nationality-specific K-ETA answer');
for(const n of ['390,000','16','18','30'])assert(html.includes(n),loc+' missing '+n);
assert(!html.includes('www.mytravelready.ai'),loc+' private guide in official sources');
assert(guide.includes('vn-danang-vi'),loc+' missing Da Nang source');
assert(!guide.includes('Several business days'),loc+' outdated processing');
}
const vi=fs.readFileSync(r+'/out/vi/visa/vietnam/index.html','utf8');
assert(vi.includes('không thuộc diện được đăng ký K-ETA'));
assert(!vi.includes('Official channels &amp; researched guides'));
assert(!vi.includes('C-3-9 short-term tourist</b>'));
assert(!vi.includes('class="entry-guidance"'), 'generic age waiver banner still on Vietnam');
assert(fs.readFileSync(r+'/out/en/visa/taiwan/index.html','utf8').includes('class="entry-guidance"'),'visa-free nationality banner lost');
console.log('PASS: 12 exported Vietnam pages; localized K-ETA answer, fees, stay, processing, Da Nang; official-only resources; Taiwan guidance preserved.');
