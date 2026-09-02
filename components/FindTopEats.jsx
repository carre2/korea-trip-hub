// "Find Korea's top-rated restaurants" — a fact-safe discovery panel for the
// food page. We do NOT hard-code restaurant ratings or SNS rankings (those are
// volatile and have no public API, so a stored number would be invented data).
// Instead we route visitors to the live, authoritative places restaurants are
// actually rated — ordered English-first, since our audience is foreign
// travellers, and each card is badged with its language support so nobody lands
// blind in a Korean-only service. Brand names + URLs are language-neutral; the
// notes and badge words come from messages.findEats.
const PLATFORMS = [
  { key: "google", brand: "Google Maps", icon: "🗺️", lang: "en", url: "https://www.google.com/maps/search/?api=1&query=best%20restaurants" },
  { key: "catchtable", brand: "CatchTable Global", icon: "📅", lang: "en", url: "https://www.catchtable.co.kr" },
  { key: "michelin", brand: "MICHELIN Guide", icon: "⭐", lang: "en", url: "https://guide.michelin.com/kr/en/restaurants" },
  { key: "tripadvisor", brand: "Tripadvisor", icon: "🦉", lang: "en", url: "https://www.tripadvisor.com/Restaurants-g294197-South_Korea.html" },
  { key: "naver", brand: "Naver Map", icon: "🟢", lang: "enapp", url: "https://map.naver.com/p/search/%EB%A7%9B%EC%A7%91" },
  { key: "kakao", brand: "KakaoMap", icon: "🟡", lang: "ko", url: "https://map.kakao.com/?q=%EB%A7%9B%EC%A7%91" },
  { key: "diningcode", brand: "Diningcode", icon: "📊", lang: "ko", url: "https://www.diningcode.com" },
  { key: "bluer", brand: "Blue Ribbon Survey", icon: "🎗️", lang: "ko", url: "https://www.bluer.co.kr" },
];

export default function FindTopEats({ m }) {
  const f = m?.findEats;
  if (!f) return null;
  const badge = { en: f.badgeEn || "English", enapp: f.badgeEnApp || "English in app", ko: f.badgeKo || "Korean" };
  return (
    <section className="findeats" aria-label={f.title}>
      <div className="fe-head">
        <span className="fe-ic" aria-hidden="true">🏅</span>
        <div>
          <h3>{f.title}</h3>
          <p className="fe-intro">{f.intro}</p>
        </div>
      </div>
      <div className="fe-grid">
        {PLATFORMS.map((p) => (
          <a key={p.key} className="fe-card" href={p.url} target="_blank" rel="noopener noreferrer">
            <span className="fe-top">
              <span className="fe-brand"><span className="fe-emoji" aria-hidden="true">{p.icon}</span>{p.brand}</span>
              <span className={`fe-lang fe-lang-${p.lang}`}>{badge[p.lang]}</span>
            </span>
            <span className="fe-note">{f[p.key]}</span>
            <span className="fe-open">{f.open || "Open"} ↗</span>
          </a>
        ))}
      </div>
      {f.sortTip && <p className="fe-tip">💡 {f.sortTip}</p>}
    </section>
  );
}
