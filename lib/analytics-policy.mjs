export const EVENT_KEYS = {
 visa_result_view:['locale','result_type','page_group'],next_step_view:['locale','placement','page_group'],next_step_click:['locale','target','placement','page_group'],official_source_click:['locale','source_type','page_group'],planner_start:['locale','route_id','placement'],itinerary_generate:['locale','route_id'],itinerary_save:['locale','route_id','storage_type'],itinerary_resume:['locale','route_id','resume_path'],itinerary_share:['locale','route_id','method'],checklist_progress:['locale','item_id','completed_count'],place_save:['locale','target','action']
};
export function eventPayload(name,params){
 if(!Object.hasOwn(EVENT_KEYS,name))return null;
 return Object.fromEntries(Object.entries(params).filter(([k,v])=>EVENT_KEYS[name].includes(k)&&(typeof v==='number'?Number.isFinite(v)&&v>=0&&v<=80:typeof v==='string'&&/^[a-zA-Z0-9_:-]{1,80}$/.test(v))));
}
export function pageGroup(path){if(/\/plan\/visa\//.test(path))return 'visa-hub';if(/\/visa\//.test(path))return 'visa-country';return path.split('/').filter(Boolean)[1]||'home'}
export function officialSource(url){try{const h=new URL(url).hostname;if(h==='k-eta.go.kr'||h.endsWith('.k-eta.go.kr'))return 'keta';if(h==='e-arrivalcard.go.kr'||h.endsWith('.e-arrivalcard.go.kr'))return 'arrival';if(h==='visa.go.kr'||h.endsWith('.visa.go.kr'))return 'visa';if(h.endsWith('.go.kr')||h==='english.visitkorea.or.kr')return 'government';return null}catch{return null}}
