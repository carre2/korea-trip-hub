import fs from 'node:fs';
import {eventCalendar,eventShareUrl} from '../lib/festivals.mjs';
const read=file=>JSON.parse(fs.readFileSync(file));
const registry=read('data/festivals.json'),copies=read('data/festivals-ui.json'),facts=read('data/facts.json').facts;
let count=0;
for(const [locale,t] of Object.entries(copies)){
  const directory=`public/festival-calendars/${locale}`;fs.mkdirSync(directory,{recursive:true});
  for(const item of registry.items){
    const fact=facts.find(f=>f.id===item.factId);
    if(fact?.status!=='VERIFIED')continue;
    const event={...item,...fact.value,verified:fact.verified,source:fact.source},copy=t.events[item.id];
    fs.writeFileSync(`${directory}/${item.id}.ics`,eventCalendar(event,copy.name,copy.venue,eventShareUrl(locale,item.id)));count++;
  }
}
console.log(`Official festival calendars generated: ${count}`);
