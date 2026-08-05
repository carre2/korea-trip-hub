// Rich "Airport / arrival & transfers" guide renderer (server component, no client JS).
// Renders data/guides/airport.json: highlight callouts, the arrival step flow, an
// airport→city transport comparison table, foreigner taxi-app cards, pitfalls and FAQ.
// Fare numbers mirror the Verified-facts boxes (facts.json).

import { linkify } from "../lib/linkify";

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

export default function AirportGuide({ guide }) {
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

      {/* Arrival step flow */}
      {g.arrival && (
        <section className="gv-sec">
          <h2>{g.arrival.title}</h2>
          {g.arrival.intro && <p className="gv-lead">{g.arrival.intro}</p>}
          <SectionPhoto s={g.arrival} />
          <ol className="gv-steps">
            {g.arrival.steps.map((s) => (
              <li key={s.n} className="gv-step">
                <span className="gv-step-n">{s.n}</span>
                <div className="gv-step-body"><h4>{s.title}</h4><p>{s.detail}</p></div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Transport comparison table */}
      {g.transport && (
        <section className="gv-sec">
          <h2>{g.transport.title}</h2>
          {g.transport.intro && <p className="gv-lead">{g.transport.intro}</p>}
          <div className="gv-table-wrap">
            <table className="gv-table">
              <thead><tr>{g.transport.cols.map((c, i) => <th key={i} className={i === 0 ? "gv-corner" : ""}>{c}</th>)}</tr></thead>
              <tbody>
                {g.transport.rows.map((r) => (
                  <tr key={r.label}><th scope="row">{r.label}</th>{r.vals.map((v, i) => <td key={i}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          {g.transport.note && <p className="gv-legend">ⓘ {g.transport.note}</p>}
        </section>
      )}

      {/* Foreigner taxi apps */}
      {g.taxiApps && (
        <section className="gv-sec">
          <h2>{g.taxiApps.title}</h2>
          {g.taxiApps.intro && <p className="gv-lead">{g.taxiApps.intro}</p>}
          <div className="ag-app-grid">
            {g.taxiApps.items.map((a) => {
              const Card = a.url ? "a" : "div";
              const props = a.url ? { href: a.url, target: "_blank", rel: "noopener noreferrer" } : {};
              return (
                <Card key={a.name} className={`ag-app ag-tone-${a.tone || "blue"}`} {...props}>
                  <div className="ag-app-h">
                    <b>{a.name}{a.url ? " ↗" : ""}</b>
                    <span className="ag-app-langs">{a.langs}</span>
                  </div>
                  <p className="ag-app-d">{a.d}</p>
                  <span className="ag-app-pay">💳 {a.pay}</span>
                </Card>
              );
            })}
          </div>
          {g.taxiApps.tip && <p className="gv-legend">ⓘ {g.taxiApps.tip}</p>}
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
