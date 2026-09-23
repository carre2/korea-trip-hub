import fs from 'node:fs';
const read=f=>JSON.parse(fs.readFileSync(f));
const locales=[...fs.readFileSync('lib/i18n.js','utf8').match(/export const locales = \[([^\]]+)/)[1].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]);
const base=read('data/topics.json'),entry=read('data/entry-guidance.json');const errors=[];
function required(a,b,p){if(typeof a==='string'){if(typeof b!=='string'||!b.trim())errors.push(p+' missing translation')}else if(Array.isArray(a)){if(!Array.isArray(b)||b.length!==a.length){errors.push(p+' array mismatch');return}a.forEach((v,i)=>required(v,b[i],p+'.'+i))}else if(a&&typeof a==='object'){for(const[k,v]of Object.entries(a)){if(['icon','color','slug','url','img','credit','creditUrl','reviewed','spot','klook','official'].includes(k))continue;required(v,b?.[k],p+'.'+k)}}}
for(const l of locales){required(entry.en,entry[l],'entry.'+l);if(l==='en')continue;const ov=read(`data/topics.${l}.json`);for(const slug of base.order)required(base.items[slug],ov.items?.[slug],'topics.'+l+'.'+slug);}
if(errors.length){console.error(errors.slice(0,30).join('\n'));process.exit(1)}console.log('Audit localization coverage PASS: entry guidance and all topic guide bodies in '+locales.length+' locales');
