// K-pop-for-visitors guide (server component). Visual-first: photo/gradient
// thumbnails, map links per place, and brand-coloured ticket badges. Live
// concert dates link out (no stale data). Images/map queries are language-
// neutral and live in data/kpop-images.json, indexed to match each section.
import kimg from "../data/kpop-images.json";

function mapUrl(q) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function Thumb({ v }) {
  if (v?.img) return <span className="kpop-thumb" style={{ backgroundImage: `url(${v.img})` }} aria-hidden="true" />;
  return (
    <span className="kpop-thumb kpop-thumb-grad" style={{ background: v?.grad }} aria-hidden="true">{v?.icon}</span>
  );
}

function PlaceCard({ item, v, mapLabel }) {
  const spot = item.spot || v?.spot;
  return (
    <div className="kpop-card">
      <Thumb v={v} />
      <div className="kpop-card-body">
        <div className="kpop-card-h"><b>{item.name}</b>{item.area && <span className="kpop-area">{item.area}</span>}</div>
        <p>{item.d}</p>
        {spot && (
          <a className="kpop-map" href={mapUrl(spot)} target="_blank" rel="noopener noreferrer">🗺️ {mapLabel}</a>
        )}
      </div>
    </div>
  );
}

export default function KpopGuide({ g, ui }) {
  if (!g) return null;
  const L = ui || {};
  const mapLabel = L.mapLabel || "map";

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
          <div className="kpop-cards">
            {g.venues.items.map((it, i) => <PlaceCard key={it.name} item={it} v={kimg.venues[i]} mapLabel={mapLabel} />)}
          </div>
        </section>
      )}

      {g.tickets && (
        <section className="gv-sec">
          <h2>🎟️ {g.tickets.title}</h2>
          <p className="gv-lead">{g.tickets.intro}</p>
          <ol className="kpop-steps">{g.tickets.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          <div className="kpop-tickets">
            {g.tickets.platforms.map((p, i) => (
              <a key={p.url} className="kpop-ticket" href={p.url} target="_blank" rel="noopener noreferrer">
                <span className="kpop-badge" style={{ background: kimg.platforms[i]?.color }}>{kimg.platforms[i]?.badge}</span>
                <span className="kpop-ticket-txt"><b>{p.name}</b> — {p.what}</span>
                <span className="kpop-ticket-arrow">↗</span>
              </a>
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
          <div className="kpop-cards">
            {g.agencies.items.map((it, i) => <PlaceCard key={it.name} item={it} v={kimg.agencies[i]} mapLabel={mapLabel} />)}
          </div>
        </section>
      )}

      {g.spots && (
        <section className="gv-sec">
          <h2>⭐ {g.spots.title}</h2>
          <p className="gv-lead">{g.spots.intro}</p>
          <div className="kpop-cards">
            {g.spots.items.map((it, i) => <PlaceCard key={it.name} item={it} v={kimg.spots[i]} mapLabel={mapLabel} />)}
          </div>
        </section>
      )}
    </div>
  );
}
