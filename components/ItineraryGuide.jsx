// Ready-made itinerary renderer (server component). Day-by-day plan with a
// Google Maps link per stop, tips, and city-aware hotel/tour booking CTAs.
// `ui` carries the localized chrome labels; city names resolve per locale.
import { agodaCity, withAff, klookSearch, DISCLOSURE } from "../lib/booking";
import { stayFor, fill } from "../lib/content";

function mapUrl(q) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function ItineraryGuide({ it, locale, ui }) {
  if (!it) return null;
  const stay = stayFor(locale);
  const cityName = (ck) => stay.cities[ck]?.name || ck;
  const L = ui || {};

  return (
    <div className="gv">
      <p className="gv-lead">{it.overview}</p>

      <ol className="itin-days">
        {it.plan.map((d) => (
          <li key={d.n} className="itin-day">
            <div className="itin-day-h">
              <span className="itin-day-n">{fill(L.dayLabel || "Day {n}", { n: d.n })}</span>
              <b>{d.area}</b>
            </div>
            <div className="itin-day-stops">
              {d.stops.map((s, i) => (
                <div key={i} className="itin-stop">
                  <span className="itin-stop-t">{s.t}</span>
                  <p>
                    {s.p}
                    {s.spot && (
                      <>
                        {" · "}
                        <a href={mapUrl(s.spot)} target="_blank" rel="noopener noreferrer">🗺️ {L.map || "map"}</a>
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {it.tips?.length > 0 && (
        <section className="gv-sec">
          <h2>{L.goodToKnow || "Good to know"}</h2>
          <ul className="tips">{it.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}

      <section className="gv-sec">
        <h2>{L.bookTrip || "Book this trip"}</h2>
        <div className="stay-links">
          {it.cities.map((ck) => (
            <a key={ck} href={withAff(agodaCity(ck), "agoda")} target="_blank" rel="sponsored nofollow noopener">
              🏨 {fill(L.hotelsIn || "Hotels in {city}", { city: cityName(ck) })} ↗
            </a>
          ))}
          <a href={klookSearch("Korea tours tickets passes")} target="_blank" rel="sponsored nofollow noopener">🎟️ {L.toursTickets || "Tours & tickets"} ↗</a>
        </div>
        <p className="bookcta-disc">ⓘ {DISCLOSURE}</p>
        <div className="itin-crosslinks">
          {it.cities.map((ck) => stay.cities[ck] && (
            <a key={ck} href={`/${locale}/stay/${ck}/`}>🏨 {fill(L.whereToStayIn || "Where to stay in {city}", { city: cityName(ck) })} →</a>
          ))}
        </div>
      </section>
    </div>
  );
}
