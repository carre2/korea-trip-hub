// Rich "Money & payments" guide renderer.
// Renders data/guides/money.json: highlights, a LIVE exchange-rate widget
// (FxRates client component), where-to-exchange cards, payment methods,
// pitfalls, FAQ and official links.
import FxRates from "./FxRates";

export default function MoneyGuide({ guide, fxLabels }) {
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

      {/* Live exchange rate */}
      <FxRates labels={fxLabels} />

      {/* Where to exchange */}
      {g.exchange && (
        <section className="gv-sec">
          <h2>{g.exchange.title}</h2>
          {g.exchange.intro && <p className="gv-lead">{g.exchange.intro}</p>}
          <div className="gv-doc-grid">
            {g.exchange.options.map((o) => (
              <div key={o.name} className={`gv-doc gv-tone-${o.tone}`}>
                <div className="gv-doc-ic">{o.icon}</div>
                <h3>{o.name}</h3>
                <p className="gv-doc-what">{o.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Payment methods */}
      {g.payments && (
        <section className="gv-sec">
          <h2>{g.payments.title}</h2>
          {g.payments.intro && <p className="gv-lead">{g.payments.intro}</p>}
          <div className="gv-check-grid">
            {g.payments.items.map((it) => (
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
