// P0 ②: "Day-1 airport kit" affiliate grid. Server component (no client JS).
// Copy is localized in data/preflight-ui.json; the only numbers shown come from
// VERIFIED facts (facts.json) with their source + as-of date, never hard-coded —
// so nothing here violates the fact-freshness harness. CTAs are real Klook
// affiliate search links (lib/booking) and open in a new tab, so the click is
// recorded as affiliate_click before any navigation.
import copyAll from '../data/preflight-ui.json';
import { klookSearch } from '../lib/booking';
import { fact } from '../lib/facts';

const CARDS = [
  { id: 'esim', icon: '📱', query: 'Korea eSIM' },
  { id: 'arex', icon: '🚄', query: 'AREX Incheon Airport Express ticket', factId: 'arex-express' },
  { id: 'transit', icon: '🚇', query: 'T-money card Korea' },
  { id: 'wowpass', icon: '💳', query: 'WOWPASS Korea' },
];

export default function PreflightGrid({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  return (
    <section className="preflight wrap" aria-label={t.title}>
      <div className="sec-head"><h2>{t.title}</h2></div>
      <p className="preflight-sub">{t.sub}</p>
      <div className="preflight-grid">
        {CARDS.map((card) => {
          const c = t.cards[card.id];
          const f = card.factId ? fact(card.factId) : null;
          const stat = f ? `⏱ ${f.value.minutes} min · ${f.value.fare}` : null;
          const srcOk = f && /^https?:\/\//.test(f.source || '');
          return (
            <article className="preflight-card" key={card.id}>
              <div className="preflight-top"><span className="preflight-icon" aria-hidden="true">{card.icon}</span><span className="preflight-badge">{c.badge}</span></div>
              <h3>{c.name}</h3>
              <p className="preflight-desc">{c.desc}</p>
              <ul className="preflight-benefits">{c.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
              {stat && <p className="preflight-stat">{stat}{' · '}
                {srcOk ? <a href={f.source} target="_blank" rel="noopener noreferrer">{f.source_name} ↗</a> : <span>{f.source_name}</span>}
                {' '}<small>({t.asOf} {f.verified})</small></p>}
              <a className="btn preflight-cta" href={klookSearch(card.query)} target="_blank" rel="sponsored nofollow noopener noreferrer">{t.cta} ↗</a>
            </article>
          );
        })}
      </div>
      <p className="preflight-disc">ⓘ {t.disclosure}</p>
    </section>
  );
}
