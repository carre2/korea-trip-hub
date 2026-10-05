"use client";
import copies from '../data/booking-ui.json';
import {klookSearch,klookUrl} from '../lib/booking';
import {koreaDay} from '../lib/festivals.mjs';
import {useExperience} from './ExperienceProvider';
import Stay22Map from './Stay22Map';

export default function PartnerBooking({locale,place,query,offer,today=koreaDay(),eventEnd}) {
  const t=copies[locale],labels=useExperience();
  const direct=offer && offer.verified<=today && offer.recheck_after>=today && (!eventEnd || eventEnd>=today);
  return <div className="partner-booking">
    <h3>🎀 {t.title}</h3>
    {query && <a className="btn partner-klook" href={direct?klookUrl(offer.url):klookSearch(query)} target="_blank" rel="sponsored nofollow noopener noreferrer">🎟️ {direct?t[offer.kind]:t.search} ↗</a>}
    {direct && <p className="festival-check">{t.checked} <time dateTime={offer.verified}>{offer.verified}</time> · <a href={klookUrl(offer.url)} target="_blank" rel="sponsored nofollow noopener noreferrer">Klook ↗</a></p>}
    {place && <Stay22Map place={place} heading={t.stay}/>}
    <p className="festival-note">{t.note}</p>
    {query && <p className="bookcta-disc">ⓘ {labels.affiliate}</p>}
  </div>;
}
