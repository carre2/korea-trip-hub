const fs=require('fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const bp='data/visa/indonesia.json',ip='data/visa/indonesia.i18n.json';
const b=read(bp),i=read(ip);
for(const g of [b,...Object.entries(i).filter(([k])=>!k.startsWith('_')).map(([,g])=>g)]){
 if(!g.metaDesc.includes('2026'))g.metaDesc+=' · 2026';
 g.applicationOffice={factId:'kvac-jakarta-location',title:'KVAC Jakarta'};
}
save(bp,b);save(ip,i);
const fp='data/facts.json',f=read(fp);
f.facts.find(x=>x.id==='kvac-jakarta-location').value={address:'Lotte Mall Ciputra World 1, Unit 5F-05A, Jl. Prof. DR. Satrio No. 1, Jakarta Selatan 12940'};
save(fp,f);
