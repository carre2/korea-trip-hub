import copies from '../data/visa-journey-ui.json';
import {klookSearch,stay22Hotels} from '../lib/booking';
export default function VisaJourney({locale,m,booking=false}){
 const t=copies[locale]||copies.en;
 const items=booking?[
  {title:t.experiences,sub:'Klook',href:klookSearch('South Korea transport activities'),target:'experiences'},
  {title:t.hotels,sub:'Stay22',href:stay22Hotels('South Korea'),target:'hotels'}
 ]:[
  {title:m.nextSteps.itinerary,sub:m.nextSteps.itinerarySub,href:`/${locale}/itinerary/`,target:'itinerary'},
  {title:m.nextSteps.stay,sub:m.nextSteps.staySub,href:`/${locale}/stay/`,target:'stay'},
  {title:m.plan.tiles.airport.title,sub:m.plan.tiles.airport.sub,href:`/${locale}/plan/airport/`,target:'airport'}
 ];
 return <section className={`visa-journey ${booking?'visa-journey-booking':''}`} data-placement={booking?'visa-booking':'visa-top'} aria-label={booking?t.bookingTitle:t.title}>
  <h2>{booking?t.bookingTitle:t.title}</h2><p>{t.note}</p>
  <div className="visa-journey-grid">{items.map(it=><a className="visa-journey-card" key={it.target} href={it.href} data-journey-target={it.target} {...(booking?{target:'_blank',rel:'sponsored nofollow noopener noreferrer'}:{})}>
   <strong>{it.title}<span aria-hidden="true"> {booking?'↗':'→'}</span></strong><span>{it.sub}</span>
  </a>)}</div>
  {!booking&&<a className="visa-journey-planner" href={`/${locale}/#planner`} data-journey-target="planner">{m.experience.plannerTitle} →</a>}
  {booking&&<p className="bookcta-disc">{m.footer.affiliateLine}</p>}
 </section>;
}
