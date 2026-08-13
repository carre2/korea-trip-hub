// K-pop-for-visitors guide (server component). Evergreen sections: concert
// venues (with map links), how to buy tickets, weekly music shows, agency
// neighborhoods and fan landmarks. Live concert dates link out (no stale data).
function mapUrl(q) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function KpopGuide({ g, ui }) {
  if (!g) return null;
  const L = ui || {};
  return (
    <div className="gv">
      {g.live && (
        <div className="kpop-live">
          <b>🔴 {g.live.title}</b>
          <p>{g.live.body}</p>
          <div className="kpop-live-links">
            {g.live.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">🎫 {l.name} ↗</a>
            ))}
          </div>
          {g.live.note && <p className="kpop-live-note">{g.live.note}</p>}
        </div>
      )}

      {g.venues && (
        <section className="gv-sec">
          <h2>🎤 {g.venues.title}</h2>
          <p className="gv-lead">{g.venues.intro}</p>
          <div className="stay-grid">
            {g.venues.items.map((v) => (
              <div key={v.name} className="stay-area stay-tone-blue">
                <div className="stay-area-h"><h3>{v.name}</h3><span className="stay-best">{v.area}</span></div>
                <p className="stay-vibe">{v.d}</p>
                {v.spot && (
                  <p className="stay-near">
                    📍 <a href={mapUrl(v.spot)} target="_blank" rel="noopener noreferrer">🗺️ {L.mapLabel || "map"}</a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {g.tickets && (
        <section className="gv-sec">
          <h2>🎟️ {g.tickets.title}</h2>
          <p className="gv-lead">{g.tickets.intro}</p>
          <ol className="kpop-steps">{g.tickets.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <div className="official-links">
            {g.tickets.platforms.map((p) => (
              <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer">🔗 {p.name} — {p.what}</a>
            ))}
          </div>
        </section>
      )}

      {g.musicShows && (
        <section className="gv-sec">
          <h2>📺 {g.musicShows.title}</h2>
          <p className="gv-lead">{g.musicShows.intro}</p>
          <div className="gv-check-grid">
            {g.musicShows.shows.map((s) => (
              <div key={s.name} className="gv-check"><span className="gv-check-ic">🎶</span><div><b>{s.name}</b><p>{s.d}</p></div></div>
            ))}
          </div>
          <ul className="tips">{g.musicShows.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}

      {g.agencies && (
        <section className="gv-sec">
          <h2>🏢 {g.agencies.title}</h2>
          <p className="gv-lead">{g.agencies.intro}</p>
          <div className="stay-grid">
            {g.agencies.items.map((a) => (
              <div key={a.name} className="stay-area stay-tone-amber">
                <div className="stay-area-h"><h3>{a.name}</h3><span className="stay-best">{a.area}</span></div>
                <p className="stay-vibe">{a.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {g.spots && (
        <section className="gv-sec">
          <h2>⭐ {g.spots.title}</h2>
          <p className="gv-lead">{g.spots.intro}</p>
          <div className="stay-grid">
            {g.spots.items.map((s) => (
              <div key={s.name} className="stay-area stay-tone-green">
                <div className="stay-area-h"><h3>{s.name}</h3><span className="stay-best">{s.area}</span></div>
                <p className="stay-vibe">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
