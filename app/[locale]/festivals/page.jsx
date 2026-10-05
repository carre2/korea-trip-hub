import {locales,getMessages,defaultLocale} from '../../../lib/i18n';
import {pageMeta,breadcrumbLd} from '../../../lib/seo';
import {fact} from '../../../lib/facts';
import JsonLd from '../../../components/JsonLd';
import FestivalExplorer from '../../../components/FestivalExplorer';
import registry from '../../../data/festivals.json';
import copies from '../../../data/festivals-ui.json';
import {koreaDay} from '../../../lib/festivals.mjs';

export function generateStaticParams(){return locales.map(locale=>({locale}));}
export function generateMetadata({params}){
  const locale=params?.locale||defaultLocale,t=copies[locale];
  return pageMeta({locale,path:'festivals',title:t.metaTitle,description:t.intro});
}
export default function FestivalsPage({params}){
  const locale=params?.locale||defaultLocale,t=copies[locale];
  const events=registry.items.flatMap(item=>{const f=fact(item.factId);return f?[{...item,...f.value,verified:f.verified,recheck_after:f.recheck_after,source:f.source,source_name:f.source_name}]:[];});
  return <article className="wrap festival-page">
    <JsonLd data={breadcrumbLd(locale,[{name:getMessages(locale).brand,path:''},{name:t.title,path:'festivals'}])}/>
    <div className="festival-heading"><span className="eyebrow">🎤 · 🎆 · 🎬</span><h1>{t.title}</h1><p>{t.intro}</p></div>
    <div className="festival-kpop"><div><h2>🎤 {t.kpop}</h2><p>{t.kpopIntro}</p></div><a className="btn ghost" href={`/${locale}/kpop/`}>{t.kpopGuide} →</a></div>
    <p className="festival-note">{t.calendarNote}</p>
    <FestivalExplorer locale={locale} t={t} events={events} initialDay={koreaDay()}/>
  </article>;
}
