// Ready-made itinerary renderer (server component). Day-by-day plan with a
// Google Maps link per stop, tips, and city-aware hotel/tour booking CTAs.
import { agodaCity, withAff, klookSearch, DISCLOSURE } from "../lib/booking";
import stayData from "../data/stay.json";

function mapUrl(q) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function ItineraryGuide({ it, locale }) {
  if (!it) return null;
  return (
    <div className="gv">
      <p className="gv-lead">{it.overview}</p>

      <ol className="itin-days">
        {it.plan.map((d) => (
          <li key={d.n} className="itin-day">
            <div className="itin-day-h">
              <span className="itin-day-n">Day {d.n}</span>
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
                        <a href={mapUrl(s.spot)} target="_blank" rel="noopener noreferrer">🗺️ map</a>
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
          <h2>Good to know</h2>
          <ul className="tips">{it.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}

      <section className="gv-sec">
        <h2>Book this trip</h2>
        <div className="stay-links">
          {it.cities.map((ck) => (
            <a key={ck} href={withAff(agodaCity(ck), "agoda")} target="_blank" rel="sponsored nofollow noopener">
              🏨 Hotels in {stayData.cities[ck]?.name || ck} ↗
            </a>
          ))}
          <a href={klookSearch("Korea tours tickets passes")} target="_blank" rel="sponsored nofollow noopener">🎟️ Tours & tickets ↗</a>
        </div>
        <p className="bookcta-disc">ⓘ {DISCLOSURE}</p>
        <div className="itin-crosslinks">
          {it.cities.map((ck) => stayData.cities[ck] && (
            <a key={ck} href={`/${locale}/stay/${ck}/`}>🏨 Where to stay in {stayData.cities[ck].name} →</a>
          ))}
        </div>
      </section>
    </div>
  );
}
