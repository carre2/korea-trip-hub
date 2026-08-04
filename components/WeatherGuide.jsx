// Rich "Weather / when to go" guide renderer.
// Renders data/guides/weather.json: highlights, a LIVE current-weather widget
// (WeatherNow), four season cards, notable periods (blossoms/foliage/monsoon/
// fine dust), pitfalls, FAQ and official links.
import WeatherNow from "./WeatherNow";

export default function WeatherGuide({ guide }) {
  if (!guide) return null;
  const g = guide;

  return (
    <div className="gv">
      {/* Highlights */}
      {g.highlights && (
        <div className="vcg-highlights">
          {g.highlights.map((h, i) => (
            <div key={i} className={`vcg-hl vcg-hl-${h.tone || "blue"}`}>
              <span className="vcg-hl-ic">{h.icon}</span>
              <div><b>{h.title}</b><p>{h.body}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Live weather */}
      <WeatherNow labels={g.wx} />

      {/* Season cards */}
      {g.seasons && (
        <section className="gv-sec">
          <h2>{g.seasons.title}</h2>
          <div className="gv-doc-grid wx-seasons">
            {g.seasons.cards.map((c) => (
              <div key={c.name} className={`gv-doc gv-tone-${c.tone}`}>
                <div className="wx-season-top">
                  <span className="gv-doc-ic">{c.icon}</span>
                  <span className="wx-season-months">{c.months}</span>
                </div>
                <h3>{c.name}</h3>
                <p className="wx-season-vibe">{c.vibe}</p>
                <p className="gv-doc-what"><b>Pack:</b> {c.pack}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notable periods */}
      {g.periods && (
        <section className="gv-sec">
          <h2>{g.periods.title}</h2>
          <div className="gv-check-grid">
            {g.periods.items.map((it) => (
              <div key={it.t} className="gv-check">
                <span className="gv-check-ic">{it.icon}</span>
                <div><b>{it.t}</b><p>{it.d}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pitfalls */}
      {g.pitfalls && (
        <section className="gv-sec">
          <h2>{g.pitfalls.title}</h2>
          <div className="gv-pit-grid">
            {g.pitfalls.items.map((it) => (
              <div key={it.t} className="gv-pit">
                <span className="gv-pit-ic">{it.icon}</span>
                <div><b>{it.t}</b><p>{it.d}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {g.faq && (
        <section className="gv-sec">
          <h2>{g.faq.title}</h2>
          <div className="gv-faq">
            {g.faq.items.map((it, i) => (
              <details key={i} className="gv-faq-item"><summary>{it.q}</summary><p>{it.a}</p></details>
            ))}
          </div>
        </section>
      )}

      {/* Official */}
      {g.official && (
        <section className="gv-sec">
          <h2>Official sources</h2>
          <div className="gv-off-grid">
            {g.official.map((o) => (
              <a key={o.name} className="gv-off" href={o.url} target="_blank" rel="noopener noreferrer">
                <span className="gv-off-ic">{o.icon}</span>
                <span className="gv-off-txt"><b>{o.name}</b><em>{o.what}</em></span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
