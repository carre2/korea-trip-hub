import { getMessages, defaultLocale } from "../../lib/i18n";
import { pageMeta, webSiteLd } from "../../lib/seo";
import JsonLd from "../../components/JsonLd";
import { fact, factsUpdated } from "../../lib/facts";
import MapExplorer from "../../components/MapExplorer";
import SpotifyKpop from "../../components/SpotifyKpop";
import TripPlanner from "../../components/TripPlanner";
import HeroSlider from "../../components/HeroSlider";
import BookCTA from "../../components/BookCTA";
import NearbyEats from "../../components/NearbyEats";
import { klookSearch } from "../../lib/booking";
import ReviewsSection from "../../components/ReviewsSection";
import destData from "../../data/destinations.json";
import destJa from "../../data/destinations.ja.json";
import destZh from "../../data/destinations.zh.json";
import destEs from "../../data/destinations.es.json";
import destFr from "../../data/destinations.fr.json";
import destDe from "../../data/destinations.de.json";
import destPt from "../../data/destinations.pt.json";
import destIt from "../../data/destinations.it.json";
import destRu from "../../data/destinations.ru.json";
import destKo from "../../data/destinations.ko.json";
import destZhTW from "../../data/destinations.zh-TW.json";
import destVi from "../../data/destinations.vi.json";
import destTh from "../../data/destinations.th.json";
import destId from "../../data/destinations.id.json";
import destTr from "../../data/destinations.tr.json";
import destFil from "../../data/destinations.fil.json";
import destMs from "../../data/destinations.ms.json";
import destHi from "../../data/destinations.hi.json";
import destAr from "../../data/destinations.ar.json";
import destBn from "../../data/destinations.bn.json";
import destImages from "../../data/dest-images.json";
import foodImages from "../../data/food-images.json";
import foodData from "../../data/food.json";
import foodJa from "../../data/food.ja.json";
import foodZh from "../../data/food.zh.json";
import foodEs from "../../data/food.es.json";
import foodFr from "../../data/food.fr.json";
import foodDe from "../../data/food.de.json";
import foodPt from "../../data/food.pt.json";
import foodIt from "../../data/food.it.json";
import foodRu from "../../data/food.ru.json";
import foodKo from "../../data/food.ko.json";
import foodZhTW from "../../data/food.zh-TW.json";
import foodVi from "../../data/food.vi.json";
import foodTh from "../../data/food.th.json";
import foodId from "../../data/food.id.json";
import foodTr from "../../data/food.tr.json";
import foodFil from "../../data/food.fil.json";
import foodMs from "../../data/food.ms.json";
import foodHi from "../../data/food.hi.json";
import foodAr from "../../data/food.ar.json";
import foodBn from "../../data/food.bn.json";

const destI18n = { ja: destJa, zh: destZh, "zh-TW": destZhTW, es: destEs, fr: destFr, de: destDe, pt: destPt, it: destIt, ru: destRu, ko: destKo, vi: destVi, th: destTh, id: destId, tr: destTr, fil: destFil, ms: destMs, hi: destHi, ar: destAr, bn: destBn };
const foodI18n = { ja: foodJa, zh: foodZh, "zh-TW": foodZhTW, es: foodEs, fr: foodFr, de: foodDe, pt: foodPt, it: foodIt, ru: foodRu, ko: foodKo, vi: foodVi, th: foodTh, id: foodId, tr: foodTr, fil: foodFil, ms: foodMs, hi: foodHi, ar: foodAr, bn: foodBn };

const PLAN_TILES = [
  { key: "visa", icon: "🛂", bg: "#BFC9FA", bd: "#9FAEF3", chip: "#3B4CE0" },
  { key: "transit", icon: "🚇", bg: "#A2E5D6", bd: "#75D4C0", chip: "#0E9280" },
  { key: "airport", icon: "✈️", bg: "#A7D9F3", bd: "#77C2E9", chip: "#1C7FBE" },
  { key: "sim", icon: "📶", bg: "#D2C2F2", bd: "#B79FEB", chip: "#6D45C4" },
  { key: "money", icon: "💳", bg: "#F2D794", bd: "#E5C066", chip: "#B96A0B" },
  { key: "weather", icon: "🌤️", bg: "#F8BAC9", bd: "#F291A8", chip: "#DC3560" },
  { key: "help", icon: "🆘", bg: "#F6B8C4", bd: "#EE93A4", chip: "#C62B49" },
  { key: "kpop", icon: "🎤", bg: "#F4B3D6", bd: "#EC8BC0", chip: "#D6247E", to: "kpop" },
];

/** Small verified-fact card for the Help section (only renders VERIFIED facts). */
function FactCard({ id, icon, iconBg, iconColor, title, sub, big, t }) {
  const f = fact(id);
  return (
    <div className="help-card">
      <div className="hic" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <h3>{title}</h3>
      <p>{sub}</p>
      {f ? (
        <>
          {big && <div className="num">{big}</div>}
          <div className="kw" style={{ marginTop: 10 }}>
            ✓ {t.verified_on} {f.verified} ·{" "}
            <a href={f.source} target="_blank" rel="noopener noreferrer">
              {f.source_name}
            </a>
          </div>
        </>
      ) : (
        <div className="kw" style={{ marginTop: 10 }}>⏳ {t.unavailable}</div>
      )}
    </div>
  );
}

export function generateMetadata({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  return pageMeta({
    locale,
    path: "",
    title: m.meta.homeTitle,
    description: m.meta.homeDesc,
  });
}

export default function Home({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const keta = fact("keta-exemption");

  return (
    <>
      <JsonLd data={webSiteLd(locale, m.meta.homeTitle, m.meta.homeDesc)} />

      {/* ===== HERO (video filmstrip) ===== */}
      <HeroSlider locale={locale} />

      {/* ===== PLAN YOUR TRIP (TOP) ===== */}
      <div className="plan-band flagbg" id="plan">
        <div className="wrap">
          <div className="plan-head">
            <h2><span className="k">Plan</span> your trip — start here</h2>
            <p>{m.plan.sub}</p>
          </div>
          <div className="plan-tiles">
            {PLAN_TILES.map((tile) => (
              <a
                key={tile.key}
                className="ptile ptile-img"
                href={`/${locale}/${tile.to ? tile.to : `plan/${tile.key}`}/`}
                style={{
                  backgroundImage: `linear-gradient(158deg, rgba(9,13,26,.42) 0%, rgba(9,13,26,.7) 100%), url(/img/hero-bg/${tile.key}.jpg)`,
                  borderColor: tile.bd,
                }}
              >
                <span className="pic" style={{ background: tile.chip }}>{tile.icon}</span>
                <b>{m.plan.tiles[tile.key].title}</b>
                <small>{m.plan.tiles[tile.key].sub}</small>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HERO / PLANNER ===== */}
      <div className="hero" id="planner">
        <div className="wrap">
          <div className="hero-badge reveal">
            <span className="pill" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
              ✦ {m.hero.badge}
            </span>
          </div>
          <h2 className="reveal">
            {m.hero.title_1}<br />
            <span className="hl">{m.hero.title_2}</span>
          </h2>
          <p className="lede reveal">{m.hero.lede}</p>

          <TripPlanner hero={m.hero} t={m.planner} />

          <div className="trustbar reveal">
            <span>🚄 <b>{m.home.trustTransport}</b> — {m.home.trustTransportSub}</span>
            <span>🗺️ <b>{m.home.trustDraft}</b> {m.home.trustDraftSub}</span>
            <span>📤 <b>{m.home.trustShare}</b> {m.home.trustShareSub}</span>
            <span>🌐 <b>{m.home.trustLangs}</b></span>
          </div>
        </div>
      </div>

      {/* ===== DESTINATIONS (search-ranked) ===== */}
      <section id="dest" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Where to go</span>
              <h2>{m.dest.title}</h2>
              <p>{m.dest.sub}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a className="btn ghost" href={`/${locale}/itinerary/`}>🗺️ Itineraries →</a>
              <a className="btn ghost" href={`/${locale}/stay/`}>🏨 Where to stay →</a>
              <a className="btn ghost" href={`/${locale}/destinations/`}>{m.dest.browseAll} →</a>
            </div>
          </div>
          <div className="grid g4">
            {["myeongdong", "n-seoul-tower", "gyeongbokgung", "bukhansan"].map((slug) => {
              const d = { ...destData.items[slug], ...(destI18n[locale]?.items?.[slug] || {}) };
              const f = d.factId ? fact(d.factId) : null;
              const stat = f && f.value ? Object.values(f.value)[0] : null;
              const im = destImages[slug];
              return (
                <a className="card" key={slug} href={`/${locale}/destinations/${slug}/`}>
                  <div className={`thumb${im ? " thumb-img" : ""}`} style={im ? undefined : { background: d.grad }}>
                    {im ? <img src={im.img} alt={d.name} width={1280} height={853} loading="lazy" /> : d.icon}
                    <span className="rank">🔎 {d.rank}</span>
                  </div>
                  <div className="cbody">
                    <h3>{d.name}</h3><p>{d.blurb}</p>
                    {stat && <div className="kw">›_ {stat}{f.value.rank ? " daily visitors" : ""}</div>}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FOOD (eat + make) ===== */}
      <section id="food">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Eat & make</span>
              <h2>{m.food.title}</h2>
              <p>{m.food.sub}</p>
            </div>
            <a className="btn ghost" href={`/${locale}/food/`}>{m.food.browseAll} →</a>
          </div>
          <h4 style={{ fontFamily: "var(--mono)", color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 12px" }}>🍜 {m.food.eat}</h4>
          <div className="grid g4">
            {foodData.eat.map((it, i) => ({ ...it, ...((foodI18n[locale]?.eat || [])[i] || {}) })).slice(0, 4).map((c) => (
              <article className="card" key={c.n}>
                <div className={`thumb${foodImages[c.key] ? " thumb-img" : ""}`} style={foodImages[c.key] ? undefined : { background: c.grad }}>
                  {foodImages[c.key] ? <img src={foodImages[c.key].img} alt={c.n} loading="lazy" /> : c.icon}
                </div>
                <div className="cbody"><h3>{c.n}</h3><p>{c.d}</p>{c.mapq && <NearbyEats q={c.mapq} label={c.n} />}</div>
              </article>
            ))}
          </div>
          <h4 style={{ fontFamily: "var(--mono)", color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".04em", margin: "26px 0 12px" }}>🥢 {m.food.make}</h4>
          <div className="grid g4">
            {foodData.make.map((it, i) => ({ ...it, ...((foodI18n[locale]?.make || [])[i] || {}) })).slice(0, 4).map((c) => (
              <article className="card" key={c.n}>
                <div className={`thumb${foodImages[c.key] ? " thumb-img" : ""}`} style={foodImages[c.key] ? undefined : { background: c.grad }}>
                  {foodImages[c.key] ? <img src={foodImages[c.key].img} alt={c.n} loading="lazy" /> : c.icon}
                  <span className="pill" style={{ position: "absolute", bottom: 12, left: 12, background: "var(--amber-soft)", color: "var(--amber)" }}>{c.tag}</span>
                </div>
                <div className="cbody"><h3>{c.n}</h3><p>{c.d}</p>{c.mapq && <NearbyEats q={c.mapq} label={c.n} />}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEALS (booking) ===== */}
      <section id="deals">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">{m.home.dealsEyebrow}</span>
              <h2>{m.home.dealsTitle}</h2>
              <p>{m.home.dealsSub}</p>
            </div>
          </div>
          <div className="deals-grid">
            <BookCTA partner="klook" icon="📲" label={m.home.dealEsim} sub={m.home.dealEsimSub} url={klookSearch("Korea eSIM")} />
            <BookCTA partner="klook" icon="🚄" label={m.home.dealKtx} sub={m.home.dealKtxSub} url={klookSearch("Korea KTX train ticket")} />
            <BookCTA partner="klook" icon="🎢" label={m.home.dealParks} sub={m.home.dealParksSub} url={klookSearch("Korea theme park attraction ticket")} />
            <BookCTA partner="klook" icon="👘" label={m.home.dealHanbok} sub={m.home.dealHanbokSub} url={klookSearch("Korea hanbok tour experience")} />
            <div className="deal-wide">
              <BookCTA partner="klook" icon="🏨" label={m.home.dealHotel} sub={m.home.dealHotelSub} url={klookSearch("Korea hotels")} disclose />
            </div>
          </div>
        </div>
      </section>

      {/* ===== REVIEWS (real, by category & language) ===== */}
      <section className="reviews" id="reviews">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">From travelers like you</span>
              <h2>{m.reviews.title}</h2>
              <p>{m.reviews.sub}</p>
            </div>
          </div>
          <ReviewsSection t={m.reviews} locale={locale} />
        </div>
      </section>

      {/* ===== K-CULTURE ===== */}
      <section id="kculture">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Hallyu</span>
              <h2>{m.spotify.title}</h2>
              <p>{m.spotify.sub}</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a className="btn ghost" href={`/${locale}/kpop/`}>🎤 K-pop travel guide →</a>
              <a className="btn ghost" href="https://kpophub.kr" target="_blank" rel="noopener noreferrer">🎫 Concerts on kpophub.kr →</a>
            </div>
          </div>
          <SpotifyKpop labels={m.spotify} />
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section id="map" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">{m.home.mapEyebrow}</span>
              <h2>{m.home.mapTitle}</h2>
              <p>{m.home.mapSub}</p>
            </div>
          </div>
          <MapExplorer labels={m.map} locale={locale} />
        </div>
      </section>

      {/* ===== HELP & SAFETY (verified facts) ===== */}
      <section id="help">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">{m.help.eyebrow}</span>
              <h2>{m.help.title}</h2>
              <p>{m.help.sub}</p>
            </div>
            {factsUpdated && (
              <span className="pill" style={{ background: "var(--jade-soft)", color: "var(--jade)" }}>
                Facts updated {factsUpdated}
              </span>
            )}
          </div>

          {/* K-ETA verified callout */}
          {keta && (
            <div className="itin" style={{ marginBottom: 18 }}>
              <div className="itin-head">
                <div className="route-lbl">🛂 Visa & K-ETA</div>
                <span className="pill" style={{ background: "var(--jade-soft)", color: "var(--jade)" }}>
                  ✓ {m.help.verified_on} {keta.verified}
                </span>
              </div>
              <div style={{ padding: "16px 22px" }}>
                <p style={{ fontWeight: 600 }}>{keta.claim}</p>
                <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 8 }}>
                  ⚠️ {keta.notes} — {m.help.check_official}:{" "}
                  <a href={keta.source} target="_blank" rel="noopener noreferrer">{keta.source_name}</a>
                </p>
              </div>
            </div>
          )}

          <div className="grid help-grid">
            <FactCard id="tourist-hotline-1330" icon="📞" iconBg="var(--jade-soft)" iconColor="var(--jade)"
              title="Tourist Help Line" sub="24/7 travel help, complaints & interpretation." big="1330" t={m.help} />
            <FactCard id="emergency-police" icon="🚨" iconBg="var(--accent-soft)" iconColor="var(--accent)"
              title="Police" sub="Nationwide emergency police number." big="112" t={m.help} />
            <FactCard id="emergency-fire-medical" icon="🚑" iconBg="var(--primary-soft)" iconColor="var(--primary)"
              title="Fire / Ambulance" sub="Fire and emergency medical." big="119" t={m.help} />
            <div className="help-card">
              <div className="hic" style={{ background: "var(--amber-soft)", color: "var(--amber)" }}>🏛️</div>
              <h3>{m.help.embassy.title}</h3>
              <p>{m.help.embassy.sub}</p>
              <div className="kw" style={{ marginTop: 10 }}>⏳ {m.help.unavailable}</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <a className="btn ghost" href={`/${locale}/plan/help/`}>🆘 {m.help.fullGuide || "Full help & emergency guide"} →</a>
            <a className="btn ghost" href={`/${locale}/ask-korea/?ref=website`} style={{ marginInlineStart: 8 }}>💬 {m.askKorea.title} →</a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer>
        <div className="wrap foot-grid">
          <div>
            <a className="brand" href={`/${locale}/`} style={{ marginBottom: 10 }}>
              <span className="mark">◆</span> Korea<b>Trip</b>Hub
            </a>
            <p style={{ maxWidth: "34ch" }}>{m.footer.tagline}</p>
          </div>
          <div>
            <h5>{m.footer.colPlan}</h5>
            <a href="#plan">{m.footer.linkPlanTrip}</a><a href="#planner">{m.nav.planner}</a><a href="#dest">{m.nav.destinations}</a><a href="#food">{m.nav.food}</a>
          </div>
          <div>
            <h5>{m.footer.colDiscover}</h5>
            <a href="#kculture">{m.nav.kculture}</a><a href="https://kpophub.kr">{m.footer.linkConcerts}</a><a href="#reviews">{m.nav.reviews}</a><a href="#help">{m.footer.linkHelpSafety}</a>
          </div>
          <div>
            <h5>{m.footer.colInfo}</h5>
            <a href="#help">{m.footer.linkVisa}</a><a href="#help">{m.footer.linkEmergency}</a><a href="#help">{m.footer.linkEmbassies}</a>
          </div>
        </div>
        <div className="note">{m.footer.disclaimer}</div>
      </footer>
    </>
  );
}
