export const ENTRY_LOCALES = ['en','zh','zh-TW','ja','vi','th','id','es','ms','ko','ru','fr'];
export function entryLanguage({cookie='',acceptLanguage='',country=''}={}) {
  const saved=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('kth_locale='))?.slice(11);
  if(ENTRY_LOCALES.includes(saved)) return saved;
  const preferences=acceptLanguage.split(',').map((part,index)=>{
    const [tag,...parameters]=part.trim().split(';');
    const q=parameters.find(x=>x.trim().startsWith('q='));
    return {tag:tag.toLowerCase(),q:q?Number(q.trim().slice(2)):1,index};
  }).filter(x=>Number.isFinite(x.q)&&x.q>0&&x.q<=1).sort((a,b)=>b.q-a.q||a.index-b.index);
  for(const {tag} of preferences){
    if(/^zh-(tw|hk|mo|hant)(-|$)/.test(tag)) return 'zh-TW';
    const language=tag.split('-')[0];
    if(ENTRY_LOCALES.includes(language)) return language;
  }
  return ({ID:'id',VN:'vi',TH:'th',MY:'ms',JP:'ja',TW:'zh-TW',HK:'zh-TW',MO:'zh-TW',CN:'zh',KR:'ko',FR:'fr',ES:'es',RU:'ru',PH:'en'})[country]||'en';
}
