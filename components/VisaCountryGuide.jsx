// Per-nationality visa deep-dive renderer (server component, no client JS).
// Renders data/visa/<country>.json: verdict, jurisdiction selector, step flow,
// document table with "where/how to get each", funds guidance, pitfalls, FAQ,
// resources and official cards. Fee/processing numbers come from facts.json.
import { fact } from "../lib/facts";
import { linkify } from "../lib/linkify";

export default function VisaCountryGuide({ guide, m }) {
  if (!guide) return null;
  const g = guide;
  const ui = g.ui || {};
  const f = g.factId ? fact(g.factId) : null;
  // Localize the fee/processing fact (claim/notes/value labels) from the active
  // locale's messages, falling back to the English base in facts.json.
  const ftr = (f && m?.facts && m.facts[g.factId]) || {};
  const fLabels = m?.factLabels || {};
  const fClaim = ftr.claim || f?.claim;
  const fNotes = ftr.notes || f?.notes;
  const REQ = {
    required: { t: ui.required || "Required", c: "gvr-req" },
    conditional: { t: ui.conditional || "If it applies", c: "gvr-cond" },
    recommended: { t: ui.recommended || "Recommended", c: "gvr-rec" },
  };

  return (
    <div className="gv">
      {/* Verdict banner */}
      {g.verdict && (
        <div className={`vcg-verdict ${g.verdict.need ? "vcg-need" : "vcg-free"}`}>
          <div className="vcg-verdict-flag">{g.flag}</div>
          <div>
            <h2>{g.verdict.headline}</h2>
            <p>{linkify(g.verdict.sub)}</p>
            <div className="vcg-verdict-meta">
              {g.verdict.type && <span><b>{ui.visa || "Visa"}</b>{g.verdict.type}</span>}
              {g.verdict.stay && <span><b>{ui.stay || "Stay"}</b>{g.verdict.stay}</span>}
              {g.verdict.entry && <span><b>{ui.entry || "Entry"}</b>{g.verdict.entry}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Highlight callouts (Jeju visa-free, group waivers, multi-year visas...) */}
      {g.highlights && g.highlights.length > 0 && (
        <div className="vcg-highlights">
          {g.highlights.map((h, i) => (
            <div key={i} className={`vcg-hl vcg-hl-${h.tone || "blue"}`}>
              <span className="vcg-hl-ic">{h.icon}</span>
              <div><b>{h.title}</b><p>{h.body}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Verified fee/processing box (harness: numbers from facts.json) */}
      {f && (
        <div className="factbox vcg-fact">
          <div className="factbox-h">
            <b>{linkify(fClaim)}</b>
            <span className="pill verified">✓ {f.verified}</span>
          </div>
          {f.value && (
            <ul className="factvals">
              {Object.entries(f.value).map(([k, v]) => (
                <li key={k}><span>{fLabels[k] || k.replace(/_/g, " ")}</span><b>{String(v)}</b></li>
              ))}
            </ul>
          )}
          <div className="factsrc">
            <span className="pill vol">⚠ {ui.confirm || "Fees/rules change — confirm at source"}</span>
            <span>{ui.source || "Source"}: <a href={f.source} target="_blank" rel="noopener noreferrer">{f.source_name}</a></span>
            {fNotes && <p className="factnote">ⓘ {linkify(fNotes)}</p>}
          </div>
        </div>
      )}

      {/* Jurisdiction selector */}
      {g.jurisdiction && (
        <section className="gv-sec">
          <h2>{g.jurisdiction.title}</h2>
          <p className="gv-lead">{g.jurisdiction.intro}</p>
          <div className="vcg-zones">
            {g.jurisdiction.zones.map((z) => (
              <a key={z.name} className="vcg-zone" href={z.url} target="_blank" rel="noopener noreferrer">
                <h3>{z.name}</h3>
                <p className="vcg-zone-covers"><b>Covers:</b> {z.covers}</p>
                <p className="vcg-zone-centers">🏢 {z.centers}</p>
                <span className="vcg-zone-site">{z.site} ↗</span>
              </a>
            ))}
          </div>
          {g.jurisdiction.note && <p className="gv-legend">ⓘ {linkify(g.jurisdiction.note)}</p>}
        </section>
      )}

      {/* Steps */}
      {g.steps && (
        <section className="gv-sec">
          <h2>{g.steps.title}</h2>
          <ol className="gv-steps">
            {g.steps.items.map((s) => (
              <li key={s.n} className="gv-step">
                <span className="gv-step-n">{s.n}</span>
                <div className="gv-step-body">
                  <h4>{s.title}</h4>
                  <p>{linkify(s.detail)}{s.link && <> — <a href={s.link} target="_blank" rel="noopener noreferrer">{s.linkLabel || s.link}</a></>}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Document table */}
      {g.documents && (
        <section className="gv-sec">
          <h2>{g.documents.title}</h2>
          <p className="gv-lead">{g.documents.intro}</p>
          <div className="vcg-docs">
            {g.documents.rows.map((r) => {
              const rq = REQ[r.req] || REQ.required;
              return (
                <div key={r.doc} className="vcg-doc">
                  <div className="vcg-doc-top">
                    <b className="vcg-doc-name">{r.doc}</b>
                    <span className={`gvr ${rq.c}`}>{rq.t}</span>
                  </div>
                  <div className="vcg-doc-where">
                    <span className="vcg-doc-lbl">{ui.where || "Where"}</span>
                    {r.link ? <a href={r.link} target="_blank" rel="noopener noreferrer">{r.where} ↗</a> : <span>{r.where}</span>}
                  </div>
                  <p className="vcg-doc-how">{linkify(r.how)}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Funds */}
      {g.funds && (
        <section className="gv-sec vcg-funds">
          <h2>{g.funds.title}</h2>
          <p className="gv-lead">{linkify(g.funds.body)}</p>
          <ul className="tips">
            {g.funds.tips.map((t, i) => <li key={i}>{linkify(t)}</li>)}
          </ul>
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
                <div><b>{it.t}</b><p>{linkify(it.d)}</p></div>
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

      {/* Official cards */}
      {g.official && (
        <section className="gv-sec">
          <h2>{ui.official || "Official sources"}</h2>
          <div className="gv-off-grid">
            {g.official.map((o) => (
              <a key={o.name + o.what} className="gv-off" href={o.url} target="_blank" rel="noopener noreferrer">
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
