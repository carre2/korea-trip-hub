// "Find Korea's top-rated restaurants" — a fact-safe discovery panel for the
// food page. We deliberately do NOT hard-code restaurant ratings or SNS
// rankings (those are volatile and not available via a public API, so any
// stored number would be an invented figure). Instead we route the visitor to
// the live, authoritative places Koreans actually rank restaurants — where the
// ratings are real and can be sorted "top first". Brand names + URLs are
// language-neutral; the one-line notes come from messages.findEats.
const PLATFORMS = [
  { key: "naver", brand: "Naver Map", icon: "🟢", url: "https://map.naver.com/p/search/%EB%A7%9B%EC%A7%91" },
  { key: "kakao", brand: "KakaoMap", icon: "🟡", url: "https://map.kakao.com/?q=%EB%A7%9B%EC%A7%91" },
  { key: "google", brand: "Google Maps", icon: "🗺️", url: "https://www.google.com/maps/search/?api=1&query=best%20restaurants" },
  { key: "diningcode", brand: "Diningcode", icon: "📊", url: "https://www.diningcode.com" },
  { key: "bluer", brand: "Blue Ribbon Survey", icon: "🎗️", url: "https://www.bluer.co.kr" },
  { key: "michelin", brand: "MICHELIN Guide", icon: "⭐", url: "https://guide.michelin.com/kr/en/restaurants" },
  { key: "catchtable", brand: "Catch Table", icon: "📅", url: "https://www.catchtable.co.kr" },
];

export default function FindTopEats({ m }) {
  const f = m?.findEats;
  if (!f) return null;
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
            <span className="fe-brand"><span className="fe-emoji" aria-hidden="true">{p.icon}</span>{p.brand}</span>
            <span className="fe-note">{f[p.key]}</span>
            <span className="fe-open">{f.open || "Open"} ↗</span>
          </a>
        ))}
      </div>
      {f.sortTip && <p className="fe-tip">💡 {f.sortTip}</p>}
    </section>
  );
}
