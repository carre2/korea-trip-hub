// Rich "Help & Emergency" guide renderer (server component, no client JS).
// Renders data/guides/help.json: big tappable emergency-number cards (numbers
// grounded in facts.json via factId), what-to-do situation cards, help apps,
// embassy guidance, pitfalls and FAQ.
import { fact } from "../lib/facts";

export default function HelpGuide({ guide }) {
  if (!guide) return null;
  const g = guide;

  return (
    <div className="gv">
      {/* Emergency numbers — big & tappable */}
      {g.numbers && (
        <section className="gv-sec">
          <h2>{g.numbers.title}</h2>
          {g.numbers.intro && <p className="gv-lead">{g.numbers.intro}</p>}
          <div className="help-num-grid">
            {g.numbers.items.map((it) => {
              const f = fact(it.factId);
              const num = f?.value?.number;
              if (!num) return null;
              return (
                <div key={it.factId} className={`help-num help-tone-${it.tone || "blue"}`}>
                  <div className="help-num-top">
                    <span className="help-num-ic">{it.icon}</span>
                    <span className="help-num-label">{it.label}</span>
                  </div>
                  <a className="help-num-big" href={`tel:${num}`}>{num}</a>
                  <p className="help-num-when">{it.when}</p>
                  {f.source && (
                    <span className="help-num-src">
                      <a href={f.source} target="_blank" rel="noopener noreferrer">{f.source_name}</a> · ✓ {f.verified}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* What to do if… */}
      {g.situations && (
        <section className="gv-sec">
          <h2>{g.situations.title}</h2>
          {g.situations.intro && <p className="gv-lead">{g.situations.intro}</p>}
          <div className="gv-doc-grid help-sit">
            {g.situations.cards.map((c) => (
              <div key={c.name} className="gv-doc">
                <div className="gv-doc-ic">{c.icon}</div>
                <h3>{c.name}</h3>
                <ol className="sim-setup">
                  {c.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Apps */}
      {g.apps && (
        <section className="gv-sec">
          <h2>{g.apps.title}</h2>
          <div className="tg-app-grid">
            {g.apps.items.map((a) => (
              <div key={a.name} className="tg-app">
                <span className="tg-app-ic">{a.icon}</span>
                <div className="tg-app-body">
                  <div className="tg-app-h"><b>{a.name}</b>{a.note && <span className="tg-app-tag">{a.note}</span>}</div>
                  <p>{a.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Embassy */}
      {g.embassy && (
        <section className="gv-sec gv-earrival">
          <h2>{g.embassy.title}</h2>
          <p className="gv-lead" style={{ margin: 0 }}>{g.embassy.body}</p>
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
