// "Where to stay" neighborhood guide (server component, no client JS).
// Renders a city's intro + area cards with Agoda (hotels) and Klook (things to
// do) links. Affiliate params attach automatically once IDs are set in booking.js.
import { agodaCity, klookSearch, withAff, DISCLOSURE } from "../lib/booking";

export default function StayGuide({ city, cityKey, ui }) {
  if (!city) return null;
  const hotelsHref = withAff(agodaCity(cityKey), "agoda");
  const findHotel = ui?.findHotel || "Find a hotel";
  const thingsToDo = ui?.thingsToDo || "Things to do";
  return (
    <div className="gv">
      <p className="gv-lead">{city.intro}</p>
      <div className="stay-grid">
        {city.areas.map((a) => (
          <div key={a.name} className={`stay-area stay-tone-${a.tone || "blue"}`}>
            <div className="stay-area-h">
              <h3>{a.name}</h3>
              <span className="stay-best">{a.best}</span>
            </div>
            <p className="stay-vibe">{a.vibe}</p>
            <p className="stay-near">📍 {a.near}</p>
            <div className="stay-links">
              <a href={hotelsHref} target="_blank" rel="sponsored nofollow noopener">🏨 {findHotel} ↗</a>
              <a href={klookSearch(`${a.name} ${city.name}`)} target="_blank" rel="sponsored nofollow noopener">🎟️ {thingsToDo} ↗</a>
            </div>
          </div>
        ))}
      </div>
      <p className="bookcta-disc">ⓘ {DISCLOSURE}</p>
    </div>
  );
}
