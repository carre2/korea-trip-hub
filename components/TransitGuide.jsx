// Rich "Getting Around" guide renderer (server component, no client JS).
// Renders data/guides/transit.json: highlight callouts, mode cards, the T-money
// step flow, bus-colour legend, taxi types, KTX-vs-SRT comparison, app cards,
// pitfalls and FAQ. Fare numbers mirror the Verified-facts boxes (facts.json).

import { linkify } from "../lib/linkify";
import BookCTA from "./BookCTA";
import { klookSearch } from "../lib/booking";

function SectionPhoto({ s }) {
  if (!s?.img) return null;
  return (
    <figure className="tg-photo">
      <img src={s.img} alt={s.imgAlt || ""} loading="lazy" />
      {s.credit && (
        <figcaption><a href={s.creditUrl} target="_blank" rel="noopener noreferrer">{s.credit}</a></figcaption>
      )}
    </figure>
  );
}

export default function TransitGuide({ guide }) {
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

      {/* Mode cards */}
      {g.modes && (
        <section className="gv-sec">
          <h2>{g.modes.title}</h2>
          {g.modes.intro && <p className="gv-lead">{g.modes.intro}</p>}
          <div className="gv-doc-grid tg-modes">
            {g.modes.cards.map((c) => (
              <div key={c.name} className={`gv-doc gv-tone-${c.tone}`}>
                <div className="tg-mode-top">
                  <span className="gv-doc-ic">{c.icon}</span>
                  <span className="tg-mode-fare">{c.fare}</span>
                </div>
                <h3>{c.name}</h3>
                <div className="gv-doc-cost">{c.best}</div>
                <p className="gv-doc-what">{c.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* T-money flow */}
      {g.tmoney && (
        <section className="gv-sec">
          <h2>{g.tmoney.title}</h2>
          {g.tmoney.intro && <p className="gv-lead">{g.tmoney.intro}</p>}
          <ol className="gv-steps gv-steps-green">
            {g.tmoney.steps.map((s) => (
              <li key={s.n} className="gv-step">
                <span className="gv-step-n">{s.n}</span>
                <div className="gv-step-body"><h4>{s.title}</h4><p>{s.detail}</p></div>
              </li>
            ))}
          </ol>
          {g.tmoney.alt && <p className="gv-legend">ⓘ {g.tmoney.alt}</p>}
        </section>
      )}

      {/* Bus colours */}
      {g.busColors && (
        <section className="gv-sec">
          <h2>{g.busColors.title}</h2>
          {g.busColors.intro && <p className="gv-lead">{g.busColors.intro}</p>}
          <SectionPhoto s={g.busColors} />
          <div className="tg-bus-grid">
            {g.busColors.items.map((b) => (
              <div key={b.name} className="tg-bus">
                <span className="tg-bus-swatch" style={{ background: b.hex }} />
                <div><b>{b.name}</b><p>{b.d}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Taxi */}
      {g.taxi && (
        <section className="gv-sec">
          <h2>{g.taxi.title}</h2>
          {g.taxi.intro && <p className="gv-lead">{g.taxi.intro}</p>}
          <SectionPhoto s={g.taxi} />
          <div className="tg-taxi-grid">
            {g.taxi.types.map((t) => (
              <div key={t.name} className="tg-taxi">
                <div className="tg-taxi-h"><b>{t.name}</b><span>{t.fare}</span></div>
                <p>{t.d}</p>
              </div>
            ))}
          </div>
          {g.taxi.tip && <p className="gv-legend">ⓘ {g.taxi.tip}</p>}
        </section>
      )}

      {/* Intercity KTX vs SRT */}
      {g.intercity && (
        <section className="gv-sec">
          <h2>{g.intercity.title}</h2>
          {g.intercity.intro && <p className="gv-lead">{g.intercity.intro}</p>}
          <SectionPhoto s={g.intercity} />
          <div className="gv-table-wrap">
            <table className="gv-table">
              <thead><tr>{g.intercity.cols.map((c, i) => <th key={i} className={i === 0 ? "gv-corner" : ""}>{c}</th>)}</tr></thead>
              <tbody>
                {g.intercity.rows.map((r) => (
                  <tr key={r.label}><th scope="row">{r.label}</th>{r.vals.map((v, i) => <td key={i}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {g.intercity.note && <p className="gv-legend">⚠ {g.intercity.note}</p>}
        </section>
      )}

      {/* Booking CTA — KTX + transit pass */}
      <BookCTA
        partner="klook"
        icon="🚄"
        label="Book KTX / SRT train tickets & transit passes"
        sub="Seoul ↔ Busan and more — reserve seats online"
        url={klookSearch("Korea KTX train ticket")}
        disclose
      />

      {/* Apps */}
      {g.apps && (
        <section className="gv-sec">
          <h2>{g.apps.title}</h2>
          <div className="tg-app-grid">
            {g.apps.items.map((a) => {
              const Card = a.url ? "a" : "div";
              const props = a.url ? { href: a.url, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Card key={a.name} className="tg-app" {...props}>
                  <span className="tg-app-ic">{a.icon}</span>
                  <div className="tg-app-body">
                    <div className="tg-app-h"><b>{a.name}{a.url ? " ↗" : ""}</b>{a.note && <span className="tg-app-tag">{a.note}</span>}</div>
                    <p>{a.d}</p>
                  </div>
                </Card>
              );
            })}
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
              <details key={i} className="gv-faq-item"><summary>{it.q}</summary><p>{linkify(it.a)}</p></details>
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
