// "Find Korea's top-rated restaurants" — a fact-safe discovery panel for the
// food page. We do NOT hard-code restaurant ratings or SNS rankings (those are
// volatile and have no public API, so a stored number would be invented data).
// Instead we route visitors to the live, authoritative places restaurants are
// actually rated, and each card is badged with the language it opens in.
//
// Outbound links open in the PAGE's own language where the service supports it:
//   • Google Maps — hl= interface-language param (all locales).
//   • Tripadvisor — one site per language on the same geo id (g294197 = South
//     Korea); only the domain changes. Falls back to .com (English) if unlisted.
//   • MICHELIN Guide — Korea selection ships ONLY in en + ko (verified 2026-11-26:
//     /kr/ja, /kr/zh_HK → 404), so ko gets Korean, everyone else English.
// Korean-only services (Naver web, KakaoMap, Diningcode, Blue Ribbon) stay Korean
// and are badged "Korean". CatchTable's English/global UI is APP-only — its web
// (app.catchtable.co.kr) is Korean — so it's badged "English in app".

const TA_DOMAIN = {
  en: "www.tripadvisor.com", ko: "www.tripadvisor.co.kr", ja: "www.tripadvisor.jp",
  "zh-TW": "www.tripadvisor.com.tw", zh: "www.tripadvisor.cn", id: "www.tripadvisor.co.id",
  vi: "www.tripadvisor.com.vn", ms: "www.tripadvisor.com.my", th: "th.tripadvisor.com",
  es: "www.tripadvisor.es", fr: "www.tripadvisor.fr", ru: "www.tripadvisor.ru",
};
const GMAPS_HL = {
  en: "en", ko: "ko", ja: "ja", zh: "zh-CN", "zh-TW": "zh-TW", vi: "vi",
  th: "th", id: "id", ms: "ms", es: "es", fr: "fr", ru: "ru",
};
// Native name of each locale, for the "opens in your language" badge.
const NATIVE = {
  en: "English", ko: "한국어", zh: "中文", "zh-TW": "繁體中文", ja: "日本語",
  vi: "Tiếng Việt", th: "ไทย", id: "Bahasa Indonesia", ms: "Bahasa Melayu",
  es: "Español", fr: "Français", ru: "Русский",
};

function buildPlatforms(locale) {
  const hl = GMAPS_HL[locale] || "en";
  const ta = TA_DOMAIN[locale] || "www.tripadvisor.com";
  const michelinKo = locale === "ko";
  return [
    { key: "google", brand: "Google Maps", icon: "🗺️", lang: "self", url: `https://www.google.com/maps/search/?api=1&query=best%20restaurants&hl=${hl}` },
    { key: "catchtable", brand: "CatchTable Global", icon: "📅", lang: "enapp", url: "https://www.catchtable.co.kr" },
    { key: "michelin", brand: "MICHELIN Guide", icon: "⭐", lang: michelinKo ? "self" : "en", url: `https://guide.michelin.com/kr/${michelinKo ? "ko" : "en"}/restaurants` },
    { key: "tripadvisor", brand: "Tripadvisor", icon: "🦉", lang: "self", url: `https://${ta}/Restaurants-g294197-South_Korea.html` },
    { key: "naver", brand: "Naver Map", icon: "🟢", lang: "enapp", url: "https://map.naver.com/p/search/%EB%A7%9B%EC%A7%91" },
    { key: "kakao", brand: "KakaoMap", icon: "🟡", lang: "ko", url: "https://map.kakao.com/?q=%EB%A7%9B%EC%A7%91" },
    { key: "diningcode", brand: "Diningcode", icon: "📊", lang: "ko", url: "https://www.diningcode.com" },
    { key: "bluer", brand: "Blue Ribbon Survey", icon: "🎗️", lang: "ko", url: "https://www.bluer.co.kr" },
  ];
}

export default function FindTopEats({ m, locale = "en" }) {
  const f = m?.findEats;
  if (!f) return null;
  const native = NATIVE[locale] || "English";
  // 'self' = opens in the page's own language; reuses the English pill's styling.
  const badgeText = { self: native, en: f.badgeEn || "English", enapp: f.badgeEnApp || "English in app", ko: f.badgeKo || "Korean" };
  const badgeCls = { self: "en", en: "en", enapp: "enapp", ko: "ko" };
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
        {buildPlatforms(locale).map((p) => (
          <a key={p.key} className="fe-card" href={p.url} target="_blank" rel="noopener noreferrer">
            <span className="fe-top">
              <span className="fe-brand"><span className="fe-emoji" aria-hidden="true">{p.icon}</span>{p.brand}</span>
              <span className={`fe-lang fe-lang-${badgeCls[p.lang]}`}>{badgeText[p.lang]}</span>
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
