import {tripPlaces,tripBases} from './custom-trip-catalog.mjs';
export {tripPlaces,tripBases};
export const CUSTOM_TRIP_KEY='kth_custom_trip_v1';
const text={type:'string'};
export const customTripSchema={type:['object','null'],additionalProperties:false,required:['title','summary','days'],properties:{
 title:text,summary:text,days:{type:'array',items:{type:'object',additionalProperties:false,required:['theme','baseId','baseReason','notes','stops'],properties:{
  theme:text,baseId:{type:'string',enum:Object.keys(tripBases)},baseReason:text,notes:text,
  stops:{type:'array',items:{type:'object',additionalProperties:false,required:['placeId','period','activity'],properties:{placeId:{type:'string',enum:Object.keys(tripPlaces)},period:text,activity:text}}}
 }}}
}};
const clean=(v,n)=>typeof v==='string' && v.trim() && v.length<=n && !/https?:\/\//i.test(v)?v.trim():null;
export function normalizeCustomTrip(raw){
 if(!raw||!clean(raw.title,160)||!clean(raw.summary,1200)||!Array.isArray(raw.days)||raw.days.length<1||raw.days.length>14)return null;
 const days=[];
 for(const d of raw.days){
  if(!d||!Object.hasOwn(tripBases,d.baseId)||!clean(d.theme,160)||!clean(d.baseReason,500)||!clean(d.notes,800)||!Array.isArray(d.stops)||!d.stops.length||d.stops.length>5)return null;
  const seen=new Set(),stops=[];
  for(const s of d.stops){
   if(!s||!Object.hasOwn(tripPlaces,s.placeId)||tripPlaces[s.placeId].city!==tripBases[d.baseId].city||seen.has(s.placeId)||!clean(s.period,80)||!clean(s.activity,400))return null;
   seen.add(s.placeId);stops.push({placeId:s.placeId,period:s.period.trim(),activity:s.activity.trim()});
  }
  days.push({theme:d.theme.trim(),baseId:d.baseId,baseReason:d.baseReason.trim(),notes:d.notes.trim(),stops});
 }
 return {v:1,title:raw.title.trim(),summary:raw.summary.trim(),days};
}
export function mapLeg(from,to){
 const q=new URLSearchParams({api:'1',origin:from,destination:to});
 return 'https://www.google.com/maps/dir/?'+q;
}
export function baseQuery(id){const b=tripBases[id];return `${b.name}, ${b.city}, South Korea`;}
export function placeQuery(id){const p=tripPlaces[id];return `${p.name}, ${p.city}, South Korea`;}
