const fs=require('fs'),r='C:/Users/user/Documents/Codex/korea-trip-hub/';
const copy=JSON.parse(fs.readFileSync(r+'data/entry-guidance.json','utf8'));
for(const code of ['thailand','malaysia','kazakhstan']){
 const bp=r+`data/visa/${code}.json`,ip=r+`data/visa/${code}.i18n.json`;
 const base=JSON.parse(fs.readFileSync(bp,'utf8')),ov=JSON.parse(fs.readFileSync(ip,'utf8'));
 const index=base.faq.items.findIndex(x=>x.q==='Do I need K-ETA?');
 for(const [locale,g]of [['en',base],...Object.entries(ov).filter(([k])=>!k.startsWith('_'))]){
  const answer=g.faq.items[index];
  if(!answer.a.includes(copy[locale].age))answer.a+=' '+copy[locale].age;
 }
 fs.writeFileSync(bp,JSON.stringify(base,null,2)+'\n');fs.writeFileSync(ip,JSON.stringify(ov,null,2)+'\n');
}
