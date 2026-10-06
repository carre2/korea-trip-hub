const fs=require('fs'),r='C:/Users/user/Documents/Codex/korea-trip-hub';const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));const save=(p,d)=>fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const copy=read(__dirname+'/indonesia-copy.json'),routing=read(r+'/data/entry-routing-ui.json');
const bp=r+'/data/visa/indonesia.json',ip=r+'/data/visa/indonesia.i18n.json',base=read(bp),i18n=read(ip);
const groupSource='https://immigration.go.kr/bbs/immigration/214/606932/artclView.do';
const feesSource='https://www.visaforkorea-in.com/id-ID/visa-center/fee';
const processingSource='https://www.visaforkorea-in.com/id-ID/customer/faq';
const placeSource='https://www.visaforkorea-in.com/id-ID/visa-center/location';
const groupPdf='https://immigration.go.kr/bbs/immigration/214/495139/download.do';
const waiverSource='https://www.moj.go.kr/bbs/immigration/214/607993/artclView.do';
const jejuSource='https://overseas.mofa.go.kr/gr-en/brd/m_22348/view.do?seq=59';
const values={visa_type:'C-3',max_stay:'Visa grant; designated group: 15 days',apply_at:'KVAC Jakarta'};
const labels={en:['Group program','Processing','Fees','Multiple entry'],id:['Program grup','Waktu proses','Biaya','Visa multiple'],ko:['단체 제도','심사기간','수수료','복수비자'],vi:['Chương trình đoàn','Thời gian xét','Lệ phí','Visa nhiều lần'],ja:['団体制度','審査期間','料金','複数ビザ'],zh:['团队制度','审理时间','费用','多次签证'],'zh-TW':['團體制度','審查時間','費用','多次簽證'],th:['โครงการกรุ๊ป','เวลาพิจารณา','ค่าธรรมเนียม','วีซ่าหลายครั้ง'],ms:['Program kumpulan','Masa proses','Yuran','Visa berbilang'],es:['Programa de grupos','Plazos','Tasas','Entrada múltiple'],fr:['Programme de groupes','Délais','Frais','Entrées multiples'],ru:['Групповая программа','Сроки','Сборы','Многократная виза']};
for(const [loc,c]of Object.entries(copy)){
 const g=loc==='en'?base:{...structuredClone(base),...i18n[loc]},t=routing[loc],l=labels[loc];
 g.updated='2026-10-05';g.metaDesc=(g.h1||g.metaTitle)+' · K-ETA · C-3 · B-2 · KVAC Jakarta';
 g.verdict.sub=t.visa;g.verdict.stay=c.stay;g.verdict.entry='C-3 / B-2';
 g.highlights[0].title=l[0];g.highlights[0].body=c.group;g.highlights[1].body=c.jeju;
 g.highlights.push({icon:'🗓️',tone:'blue',title:l[3],body:c.multi});
 g.tldr[3]=c.group;g.steps.items[0].detail=t.visa+' '+c.group;g.steps.items[4].detail=c.fee;
 g.steps.items[5].detail=c.processing;g.documents.rows[6].req='recommended';g.documents.rows[6].how=c.processing;
 g.pitfalls.items[0].d=c.group;
 const assignments={0:t.visa+' '+c.group,1:t.visa+' '+c.group,4:c.fee,5:t.arrival,6:c.jeju,7:c.processing};
 const ids={0:'visa-indonesia-c3',1:'visa-indonesia-c3',4:'visa-indonesia-fees',5:'earrival-card-how',6:'visa-indonesia-jeju',7:'visa-indonesia-processing'};
 for(const [i,a]of Object.entries(assignments)){g.faq.items[i].a=a;g.faq.items[i].factId=ids[i];}
 g.faq.items.push({q:'K-ETA?',a:t.visa,factId:'keta-visa-distinction'},{q:l[3]+'?',a:c.multi,factId:'visa-indonesia-multiple'});
 g.factValueLabels={[values.visa_type]:g.verdict.type,[values.max_stay]:c.stay,[values.apply_at]:'KVAC Jakarta'};
 g.resources={title:g.ui?.official||'Official sources',intro:t.visa,items:[['Korea Visa Portal','https://www.visa.go.kr'],['KVAC Jakarta',placeSource],['KVAC · IDR',feesSource],['KVAC · FAQ',processingSource],['B-2 · Indonesia',groupSource],['C-3-2',waiverSource]].map(([brand,url])=>({label:(g.ui?.official||'Official sources')+' · '+brand,src:new URL(url).hostname,url}))};
 g.official=g.resources.items.map((it,i)=>({icon:i===0?'📄':'🏢',name:it.label,url:it.url,what:i===4?c.group:i===2?c.fee:i===3?c.processing:i===5?t.groupFee:t.visa}));
 if(loc!=='en')i18n[loc]=g;
 const mp=r+'/messages/'+loc+'.json',m=read(mp);m.facts['visa-indonesia-c3']={claim:t.visa+' '+c.group,notes:c.stay};save(mp,m);
}
save(bp,base);save(ip,i18n);
const fp=r+'/data/facts.json',facts=read(fp);const existing=facts.facts.find(f=>f.id==='visa-indonesia-c3');
Object.assign(existing,{claim:routing.en.visa+' '+copy.en.group,value:values,source:groupSource,source_name:'Korea Ministry of Justice',verified:'2026-10-05',recheck_after:'2026-11-05',notes:copy.en.stay,sources:[{name:'Ministry of Justice · group procedure',url:groupPdf},{name:'KVAC Jakarta',url:feesSource}]});
const specs=[
 ['keta-visa-distinction',routing.en.visa,'https://www.k-eta.go.kr/portal/guide/viewetaapplication.do?locale=EN','Korea Immigration Service · K-ETA'],
 ['group-c32-fee-waiver',routing.en.groupFee,waiverSource,'Korea Ministry of Justice'],
 ['visa-indonesia-processing',copy.en.processing,processingSource,'KVAC Jakarta · FAQ'],
 ['visa-indonesia-fees',copy.en.fee,feesSource,'KVAC Jakarta'],
 ['visa-indonesia-multiple',copy.en.multi,feesSource,'KVAC Jakarta'],
 ['visa-indonesia-jeju',copy.en.jeju,jejuSource,'Embassy of Korea · Jeju entry'],
 ['kvac-jakarta-location','KVAC Jakarta: Lotte Mall Ciputra World 1 Unit 5F-05A, 5th floor, Jl. Prof. DR. Satrio No.1, Jakarta Selatan 12940. Applications 09:00–15:00 WIB Monday–Friday except holidays.',placeSource,'KVAC Jakarta']
];
for(const [id,claim,source,source_name]of specs){facts.facts=facts.facts.filter(f=>f.id!==id);facts.facts.push({id,tier:'VOLATILE',status:'VERIFIED',claim,source,source_name,verified:'2026-10-05',recheck_after:'2026-11-05',notes:'Confirm eligibility, current conditions and documents with the official authority before travel.'});}
save(fp,facts);
console.log('Indonesia official policy update in all 12 locales; shared visa/K-ETA distinction and C-3-2 waiver facts.');
