import { getMessages, defaultLocale, locales } from "../../lib/i18n";
import { pageMeta, webSiteLd } from "../../lib/seo";
import JsonLd from "../../components/JsonLd";

import MapExplorer from "../../components/MapExplorer";
import { itinFor } from "../../lib/content";
import TripPlanner from "../../components/TripPlanner";
import HeroSlider from "../../components/HeroSlider";

import NearbyEats from "../../components/NearbyEats";

import ReviewsSection from "../../components/ReviewsSection";
import destData from "../../data/destinations.json";
import destJa from "../../data/destinations.ja.json";
import destZh from "../../data/destinations.zh.json";
import destEs from "../../data/destinations.es.json";
import destFr from "../../data/destinations.fr.json";
import destDe from "../../data/destinations.de.json";
import destPt from "../../data/destinations.pt.json";
import destIt from "../../data/destinations.it.json";
import destRu from "../../data/destinations.ru.json";
import destKo from "../../data/destinations.ko.json";
import destZhTW from "../../data/destinations.zh-TW.json";
import destVi from "../../data/destinations.vi.json";
import destTh from "../../data/destinations.th.json";
import destId from "../../data/destinations.id.json";
import destTr from "../../data/destinations.tr.json";
import destFil from "../../data/destinations.fil.json";
import destMs from "../../data/destinations.ms.json";
import destHi from "../../data/destinations.hi.json";
import destAr from "../../data/destinations.ar.json";
import destBn from "../../data/destinations.bn.json";
import destImages from "../../data/dest-images.json";
import foodImages from "../../data/food-images.json";
import foodData from "../../data/food.json";
import foodJa from "../../data/food.ja.json";
import foodZh from "../../data/food.zh.json";
import foodEs from "../../data/food.es.json";
import foodFr from "../../data/food.fr.json";
import foodDe from "../../data/food.de.json";
import foodPt from "../../data/food.pt.json";
import foodIt from "../../data/food.it.json";
import foodRu from "../../data/food.ru.json";
import foodKo from "../../data/food.ko.json";
import foodZhTW from "../../data/food.zh-TW.json";
import foodVi from "../../data/food.vi.json";
import foodTh from "../../data/food.th.json";
import foodId from "../../data/food.id.json";
import foodTr from "../../data/food.tr.json";
import foodFil from "../../data/food.fil.json";
import foodMs from "../../data/food.ms.json";
import foodHi from "../../data/food.hi.json";
import foodAr from "../../data/food.ar.json";
import foodBn from "../../data/food.bn.json";

const destI18n = { ja: destJa, zh: destZh, "zh-TW": destZhTW, es: destEs, fr: destFr, de: destDe, pt: destPt, it: destIt, ru: destRu, ko: destKo, vi: destVi, th: destTh, id: destId, tr: destTr, fil: destFil, ms: destMs, hi: destHi, ar: destAr, bn: destBn };
const foodI18n = { ja: foodJa, zh: foodZh, "zh-TW": foodZhTW, es: foodEs, fr: foodFr, de: foodDe, pt: foodPt, it: foodIt, ru: foodRu, ko: foodKo, vi: foodVi, th: foodTh, id: foodId, tr: foodTr, fil: foodFil, ms: foodMs, hi: foodHi, ar: foodAr, bn: foodBn };

import SavedPlaces from "../../components/SavedPlaces";

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  return pageMeta({
    locale,
    path: "",
    title: m.meta.homeTitle,
    description: m.meta.homeDesc,
  });
}

export default function Home({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale), t = m.experience;
  const itineraries = itinFor(locale);
  const destination = (slug) => ({ ...destData.items[slug], ...(destI18n[locale]?.items?.[slug] || {}) });
  const routeOptions = Object.fromEntries(itineraries.order.map((key) => {
    const { title, plan } = itineraries.items[key]; return [key, { title, plan }];
  }));
  const placeCatalog = Object.fromEntries(Object.entries(destData.items).map(([slug])=>['dest:'+slug,{name:destination(slug).name,path:'destinations/'+slug+'/'}]));
  for(const category of ['eat','make','regional']) (foodData[category]||[]).forEach((item,i)=>{placeCatalog['food:'+item.key]={name:foodI18n[locale]?.[category]?.[i]?.n||item.n,path:'food/#food-'+item.key}});
  const checklist = ['visa', 'airport', 'sim', 'money'].map((key) => ({ id: key, label: m.plan.tiles[key].title, path: `plan/${key}` }));
  checklist.push({ id: 'stay', label: m.nextSteps.stay, path: 'stay' });
  const starts = [
    { title: t.entry, sub: t.entrySub, href: `/${locale}/plan/visa/`, icon: '01' },
    { title: t.arrival, sub: t.arrivalSub, href: `/${locale}/plan/airport/`, icon: '02' },
    { title: t.explore, sub: t.exploreSub, href: `/${locale}/destinations/`, icon: '03' },
  ];
  return <div className="journey-home">
    <JsonLd data={webSiteLd(locale, m.meta.homeTitle, m.meta.homeDesc)} />
    <HeroSlider locale={locale} t={t} languageCount={locales.length} image={destImages.gyeongbokgung} imageLabel={destination('gyeongbokgung').name} />
    <section id="plan" className="journey-start wrap">
      <div className="sec-head"><h2>{t.chooseTitle}</h2><a href="#planner">{t.myTrip} ↗</a></div>
      <div className="journey-start-grid">{starts.map((item) => <a className="journey-start-card" key={item.icon} href={item.href}>
        <span className="journey-number">{item.icon}</span><h3>{item.title}</h3><p>{item.sub}</p><span aria-hidden="true" className="journey-arrow">↗</span>
      </a>)}</div>
      <div className="journey-essentials"><h3>{t.essentials}</h3><div>{['visa','airport','transit','sim','money','weather','help'].map((key) => <a key={key} href={`/${locale}/plan/${key}/`}>{m.plan.tiles[key].title} →</a>)}</div></div>
    </section>
    <section id="planner" className="journey-planner"><div className="wrap">
      <div className="sec-head"><div><span className="eyebrow">{t.myTrip}</span><h2>{t.plannerTitle}</h2><p>{t.plannerSub}</p></div><a href={`/${locale}/itinerary/`}>{m.nextSteps.itinerary} →</a></div>
      <SavedPlaces catalog={placeCatalog} locale={locale} t={t} /><TripPlanner catalog={placeCatalog} locale={locale} labels={t} routes={routeOptions} order={itineraries.order} ui={{dayLabel: itineraries.ui.dayLabel, map: itineraries.ui.map}} checklist={checklist} />
    </div></section>
    <section id="dest" className="wrap journey-discover">
      <div className="sec-head"><div><span className="eyebrow">{t.explore}</span><h2>{m.dest.title}</h2></div><a href={`/${locale}/destinations/`}>{m.dest.browseAll} →</a></div>
      <div className="journey-photo-grid">{['bukchon','haeundae','seongsan','bulguksa'].map((slug) => {
        const d=destination(slug), im=destImages[slug];
        return <article className="journey-place" key={slug}><a href={`/${locale}/destinations/${slug}/`}><img src={im.img} alt={d.name} width="1280" height="853" loading="lazy" /><div><span className="korea-place-mark" aria-hidden="true" lang="ko">{({bukchon:'서울',haeundae:'부산',seongsan:'제주',bulguksa:'경주'})[slug]}</span><h3>{d.name}</h3><p>{d.blurb}</p></div></a><small><a href={im.creditUrl} target="_blank" rel="noopener noreferrer">{im.credit}</a></small></article>;
      })}</div>
    </section>
    <section id="food" className="wrap journey-food"><div className="sec-head"><h2>{m.food.title}</h2><a href={`/${locale}/food/`}>{m.food.browseAll} →</a></div>
      <div className="journey-food-grid">{foodData.eat.slice(0,3).map((base,i)=>{
        const item={...base,...foodI18n[locale]?.eat?.[i]}, im=foodImages[item.key];
        return <article className="journey-food-card" key={item.key}>{im && <img src={im.img} alt={item.n} width="400" height="300" loading="lazy" />}<div><h3>{item.n}</h3><p>{item.d}</p>{item.mapq && <NearbyEats q={item.mapq} label={item.n} />}{im?.credit && <small className="journey-credit"><a href={im.creditUrl} target="_blank" rel="noopener noreferrer">{im.credit}</a></small>}</div></article>;
      })}</div>
    </section>
    <section className="wrap journey-more" id="kculture"><div><span className="eyebrow">{m.guides.eyebrow}</span><h2>{m.guides.title}</h2><p>{m.guides.sub}</p><a className="btn ghost" href={`/${locale}/guides/`}>{t.details} →</a></div><div><span className="eyebrow">{m.nav.kculture}</span><h2>{m.plan.tiles.kpop.title}</h2><p>{m.plan.tiles.kpop.sub}</p><a className="btn ghost" href={`/${locale}/kpop/`}>{t.details} →</a></div></section>
    <section id="map" className="journey-map"><div className="wrap"><details><summary>{m.home.mapTitle}</summary><MapExplorer labels={m.map} locale={locale} /></details></div></section>
    <section id="reviews" className="wrap journey-review"><details><summary>{m.reviews.title}</summary><ReviewsSection t={m.reviews} locale={locale} /></details></section>
    <section id="help" className="wrap journey-help"><div><span className="eyebrow">{m.help.eyebrow}</span><h2>{m.help.title}</h2><p>{m.help.sub}</p></div><a className="btn ghost" href={`/${locale}/plan/help/`}>{m.plan.tiles.help.title} →</a></section>
  </div>;
}
