import copy from '../data/entry-guidance.json';
import routing from '../data/entry-routing-ui.json';
import {fact} from '../lib/facts';
export default function EntryGuidance({locale, compact=false, visaRequired=false, hub=false}) {
  const t=copy[locale]||copy.en, r=routing[locale]||routing.en;
  const eligibility=fact('keta-visa-distinction');
  if (!eligibility || eligibility.status!=='VERIFIED') return null;
  const reviewed=<p className="entry-reviewed"><time dateTime={eligibility.verified}>{eligibility.verified}</time> · <a href={eligibility.source} target="_blank" rel="noopener noreferrer">K-ETA ↗</a></p>;

  // Visa-required passports must never inherit the visa-free age/waiver banner.
  if (visaRequired) return (
    <section className="entry-guidance entry-visa-required">
      <h3>{r.title}</h3>
      <p><b>{r.visa}</b></p>
      <p>{r.arrival}</p>
      <div className="entry-official">
        <a href="https://www.visa.go.kr" target="_blank" rel="noopener noreferrer">Korea Visa Portal ↗</a>
        <a href="https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E" target="_blank" rel="noopener noreferrer">{t.arrivalTitle} ↗</a>
      </div>
      {reviewed}
    </section>
  );
  if (!['keta-exemption','earrival-card-how','keta-age-exemption','keta-apply-window'].every(id=>fact(id)?.status==='VERIFIED')) return null;
  return (
    <section className="entry-guidance">
      <h3>{r.title}</h3>
      <p><b>{hub?r.hub:r.ketaOnly}</b></p>
      <p>{t.body}</p>
      <div className="entry-official">
        <a href="https://www.e-arrivalcard.go.kr/portal/guide/navigator.do?locale=E" target="_blank" rel="noopener noreferrer">{t.arrivalTitle} ↗</a>
        <a href="https://www.k-eta.go.kr/portal/guide/viewetaapplication.do?locale=EN" target="_blank" rel="noopener noreferrer">K-ETA ↗</a>
        <a href="https://www.visa.go.kr" target="_blank" rel="noopener noreferrer">Korea Visa Portal ↗</a>
      </div>
      {reviewed}
      {compact ? (
        <details><summary>{r.ketaOnly}</summary><p>{t.waiver}</p><p>{t.arrival}</p><p>{t.age}</p><p>{t.processing}</p></details>
      ) : (
        <div className="entry-conditions">{['waiver','arrival','age'].map(k=><section key={k}><h3>{t[k+'Title']}</h3><p>{t[k]}</p></section>)}</div>
      )}
      <p>{t.note}</p>
    </section>
  );
}
