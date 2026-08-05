// Rich visual guide renderer (server component, no client JS).
// Renders the structured "guide" content (data/guides/<slug>.json) as a series
// of visual sections: TL;DR, document cards, decision matrix, comparison table,
// step flows, prep checklist, exempt-country chips, pitfalls, FAQ (native
// <details>), curated resources, and official-link cards.
// Facts/numbers shown here mirror the Verified-facts boxes (grounded in facts.json).

import { linkify } from "../lib/linkify";

export default function GuideVisual({ guide }) {
  if (!guide) return null;
  const g = guide;
  const ui = g.ui || {};
  const dhead = ui.dhead || { situation: "Your situation", visa: "Visa", keta: "K-ETA", earrival: "e-Arrival" };
  const PILL = ui.pills || { yes: "Required", "yes*": "Required*", no: "Not needed", waived: "Waived '26", "n/a": "—" };
  const CLS = { yes: "gv-need", "yes*": "gv-need", no: "gv-no", waived: "gv-waived", "n/a": "gv-na" };
  const YesNo = ({ v }) => <span className={`gv-pill ${CLS[v] || "gv-na"}`}>{PILL[v] || v}</span>;

  return (
    <div className="gv">
      {/* Document cards */}
      {g.documents && (
        <section className="gv-sec">
          <h2>{g.documents.title}</h2>
          <p className="gv-lead">{g.documents.intro}</p>
          <div className="gv-doc-grid">
            {g.documents.cards.map((c) => (
              <div key={c.name} className={`gv-doc gv-tone-${c.tone}`}>
                <div className="gv-doc-ic">{c.icon}</div>
                <h3>{c.name}</h3>
                <div className="gv-doc-cost">{c.cost}</div>
                <p className="gv-doc-who"><b>{ui.who || "Who:"}</b> {c.who}</p>
                <p className="gv-doc-what">{linkify(c.what)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Decision matrix */}
      {g.decision && (
        <section className="gv-sec">
          <h2>{g.decision.title}</h2>
          <p className="gv-lead">{g.decision.intro}</p>
          <div className="gv-decision">
            <div className="gv-dhead">
              <span>{dhead.situation}</span>
              <span>{dhead.visa}</span>
              <span>{dhead.keta}</span>
              <span>{dhead.earrival}</span>
            </div>
            {g.decision.branches.map((b, i) => (
              <div className="gv-drow" key={i}>
                <div className="gv-dcase">
                  <div>{b.case}</div>
                  <div className="gv-dsum">→ {b.summary}</div>
                </div>
                <YesNo v={b.visa} />
                <YesNo v={b.keta} />
                <YesNo v={b.earrival} />
              </div>
            ))}
          </div>
          {g.decision.legend && <p className="gv-legend">{g.decision.legend}</p>}
        </section>
      )}

      {/* Comparison table */}
      {g.compare && (
        <section className="gv-sec">
          <h2>{g.compare.title}</h2>
          <div className="gv-table-wrap">
            <table className="gv-table">
              <thead>
                <tr>{g.compare.cols.map((c, i) => <th key={i} className={i === 0 ? "gv-corner" : ""}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {g.compare.rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    {r.vals.map((v, i) => <td key={i}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* K-ETA step flow */}
      {g.ketaSteps && (
        <section className="gv-sec">
          <h2>{g.ketaSteps.title}</h2>
          {g.ketaSteps.note && <p className="gv-lead">{g.ketaSteps.note}</p>}
          <ol className="gv-steps">
            {g.ketaSteps.steps.map((s) => (
              <li key={s.n} className="gv-step">
                <span className="gv-step-n">{s.n}</span>
                <div className="gv-step-body">
                  <h4>{s.title}</h4>
                  <p>{linkify(s.detail)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Prepare checklist */}
      {g.prepare && (
        <section className="gv-sec">
          <h2>{g.prepare.title}</h2>
          <div className="gv-check-grid">
            {g.prepare.items.map((it) => (
              <div key={it.t} className="gv-check">
                <span className="gv-check-ic">{it.icon}</span>
                <div>
                  <b>{it.t}</b>
                  <p>{linkify(it.d)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* e-Arrival flow */}
      {g.earrival && (
        <section className="gv-sec gv-earrival">
          <h2>{g.earrival.title}</h2>
          <p className="gv-lead">{g.earrival.intro}</p>
          <ol className="gv-steps gv-steps-green">
            {g.earrival.steps.map((s) => (
              <li key={s.n} className="gv-step">
                <span className="gv-step-n">{s.n}</span>
                <div className="gv-step-body">
                  <h4>{s.title}</h4>
                  <p>{linkify(s.detail)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Exempt countries */}
      {g.exempt && (
        <section className="gv-sec">
          <h2>{g.exempt.title}</h2>
          <p className="gv-lead">{g.exempt.intro}</p>
          <div className="gv-flags">
            {g.exempt.countries.map((c) => (
              <span key={c.n} className="gv-flag"><span className="gv-flag-e">{c.flag}</span>{c.n}</span>
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
                <div>
                  <b>{it.t}</b>
                  <p>{linkify(it.d)}</p>
                </div>
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
              <details key={i} className="gv-faq-item">
                <summary>{it.q}</summary>
                <p>{linkify(it.a)}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {g.resources && (
        <section className="gv-sec">
          <h2>{g.resources.title}</h2>
          {g.resources.intro && <p className="gv-lead">{g.resources.intro}</p>}
          <div className="gv-res-grid">
            {g.resources.items.map((it) => (
              <a key={it.url} className="gv-res" href={it.url} target="_blank" rel="noopener noreferrer">
                <span className="gv-res-label">{it.label}</span>
                <span className="gv-res-src">{it.src} ↗</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Official link cards */}
      {g.officialCards && (
        <section className="gv-sec">
          <h2>{ui.official || "Official sources"}</h2>
          <div className="gv-off-grid">
            {g.officialCards.map((o) => (
              <a key={o.name + o.what} className="gv-off" href={o.url} target="_blank" rel="noopener noreferrer">
                <span className="gv-off-ic">{o.icon}</span>
                <span className="gv-off-txt">
                  <b>{o.name}</b>
                  <em>{o.what}</em>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
