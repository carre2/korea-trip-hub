import { linkify } from "../lib/linkify";

// Shared "passport-photo spec" card for visa-REQUIRED country guides. A rejected
// photo is one of the most common causes of a delayed Korea visa, so a clear,
// verified spec is exactly the "take everything" completeness a visa applicant
// needs. Numbers are grounded (Korea Visa Portal / consulate rules); strings are
// translated once in messages.visaPhoto and reused across every visa-required guide.
export default function VisaPhotoSpec({ m }) {
  const v = m?.visaPhoto;
  if (!v) return null;
  return (
    <section className="visaphoto" aria-label={v.title}>
      <div className="vp-head">
        <span className="vp-ic" aria-hidden="true">📷</span>
        <h2>{v.title}</h2>
      </div>
      {v.intro && <p className="vp-intro">{v.intro}</p>}
      <ul className="vp-list">
        {[v.p1, v.p2, v.p3, v.p4].filter(Boolean).map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
      {v.source && <p className="vp-src">{linkify(v.source)}</p>}
    </section>
  );
}
