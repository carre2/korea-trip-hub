// Rich "SIM / eSIM / Wi-Fi" guide renderer (server component, no client JS).
// Renders data/guides/sim.json: highlights, an eSIM-vs-SIM-vs-pocket-Wi-Fi
// comparison table, per-option setup cards, pitfalls, FAQ and official links.
// No prices are shown (HARNESS): plans vary, so we compare by type.

import { linkify } from "../lib/linkify";
import BookCTA from "./BookCTA";
import { klookSearch } from "../lib/booking";

export default function SimGuide({ guide }) {
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

      {/* Comparison table */}
      {g.compare && (
        <section className="gv-sec">
          <h2>{g.compare.title}</h2>
          <div className="gv-table-wrap">
            <table className="gv-table">
              <thead><tr>{g.compare.cols.map((c, i) => <th key={i} className={i === 0 ? "gv-corner" : ""}>{c}</th>)}</tr></thead>
              <tbody>
                {g.compare.rows.map((r) => (
                  <tr key={r.label}><th scope="row">{r.label}</th>{r.vals.map((v, i) => <td key={i}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Option setup cards */}
      {g.options && (
        <section className="gv-sec">
          <h2>{g.options.title}</h2>
          {g.options.intro && <p className="gv-lead">{g.options.intro}</p>}
          <div className="gv-doc-grid sim-opts">
            {g.options.cards.map((c) => (
              <div key={c.name} className={`gv-doc gv-tone-${c.tone}`}>
                <div className="gv-doc-ic">{c.icon}</div>
                <h3>{c.name}</h3>
                <div className="gv-doc-cost">{c.best}</div>
                <ol className="sim-setup">
                  {c.setup.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
                {c.links && (
                  <div className="sim-applinks">
                    {c.links.map((l) => (
                      <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer">{l.name} ↗</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking CTA — eSIM */}
      <BookCTA
        partner="klook"
        icon="📲"
        label="Get a Korea eSIM online"
        sub="Instant delivery — data works the moment you land"
        url={klookSearch("Korea eSIM")}
        disclose
      />

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
