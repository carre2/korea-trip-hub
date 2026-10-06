const fs=require('fs'),r='C:/Users/user/Documents/Codex/korea-trip-hub/';
const p=r+'data/entry-routing-ui.json',copy=JSON.parse(fs.readFileSync(p,'utf8'));
const explicit={en:'Ordinary passports that require a tourist visa are not eligible for K-ETA for that visit.',ko:'일반 관광비자가 필요한 일반여권은 해당 방문에 K-ETA를 신청할 수 없습니다.',id:'Paspor biasa yang wajib visa wisata tidak memenuhi syarat K-ETA untuk kunjungan tersebut.',vi:'Hộ chiếu phổ thông cần visa du lịch không thuộc diện đăng ký K-ETA cho chuyến đi đó.',ja:'通常の観光ビザが必要な一般旅券は、その訪問にK-ETAを申請できません。',zh:'需要普通旅游签证的普通护照，不能为该次访问申请K-ETA。','zh-TW':'需要一般觀光簽證的普通護照，不能為該次訪問申請K-ETA。',th:'หนังสือเดินทางทั่วไปที่ต้องขอวีซ่าท่องเที่ยวไม่มีสิทธิ์ขอ K-ETA สำหรับการเดินทางนั้น',ms:'Pasport biasa yang memerlukan visa pelancong tidak layak memohon K-ETA untuk lawatan tersebut.',es:'Los pasaportes ordinarios que necesitan visa turística no son elegibles para K-ETA en esa visita.',fr:'Les passeports ordinaires nécessitant un visa touristique ne sont pas admissibles à K-ETA pour cette visite.',ru:'Обычные паспорта, для которых нужна туристическая виза, не подходят для K-ETA для такой поездки.'};
const replacements=Object.entries(copy).map(([l,c])=>[c.visa,explicit[l]+' '+c.visa]);
const paths=['data/visa/indonesia.json','data/visa/indonesia.i18n.json','data/facts.json',...Object.keys(copy).map(l=>'messages/'+l+'.json')];
function update(x){if(typeof x==='string'){for(const[a,b]of replacements)x=x.replaceAll(a,b);return x;}if(Array.isArray(x))return x.map(update);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,update(v)]));return x;}
for(const path of paths){const full=r+path;fs.writeFileSync(full,JSON.stringify(update(JSON.parse(fs.readFileSync(full,'utf8'))),null,2)+'\n');}
for(const [l,c]of Object.entries(copy))c.visa=explicit[l]+' '+c.visa;
fs.writeFileSync(p,JSON.stringify(copy,null,2)+'\n');
const fp=r+'data/facts.json',facts=JSON.parse(fs.readFileSync(fp,'utf8'));
facts.facts.find(f=>f.id==='keta-visa-distinction').sources=[{name:'K-ETA eligible countries / applicants',url:'https://www.k-eta.go.kr/portal/guide/viewetaalification.do'}];
fs.writeFileSync(fp,JSON.stringify(facts,null,2)+'\n');
