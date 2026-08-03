import { getMessages, defaultLocale } from "../../lib/i18n";
import { fact, factsUpdated } from "../../lib/facts";
import MapExplorer from "../../components/MapExplorer";
import SpotifyKpop from "../../components/SpotifyKpop";
import TripPlanner from "../../components/TripPlanner";
import destData from "../../data/destinations.json";

const PLAN_TILES = [
  { key: "visa", icon: "🛂", bg: "#BFC9FA", bd: "#9FAEF3", chip: "#3B4CE0" },
  { key: "transit", icon: "🚇", bg: "#A2E5D6", bd: "#75D4C0", chip: "#0E9280" },
  { key: "airport", icon: "✈️", bg: "#A7D9F3", bd: "#77C2E9", chip: "#1C7FBE" },
  { key: "sim", icon: "📶", bg: "#D2C2F2", bd: "#B79FEB", chip: "#6D45C4" },
  { key: "money", icon: "💳", bg: "#F2D794", bd: "#E5C066", chip: "#B96A0B" },
  { key: "weather", icon: "🌤️", bg: "#F8BAC9", bd: "#F291A8", chip: "#DC3560" },
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

export default function Home({ params }) {
  const locale = params?.locale || defaultLocale;
  const m = getMessages(locale);
  const keta = fact("keta-exemption");

  return (
    <>
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
                className="ptile"
                href={`/${locale}/plan/${tile.key}/`}
                style={{ background: tile.bg, borderColor: tile.bd }}
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
          <h1 className="reveal">
            {m.hero.title_1}<br />
            <span className="hl">{m.hero.title_2}</span>
          </h1>
          <p className="lede reveal">{m.hero.lede}</p>

          <TripPlanner hero={m.hero} t={m.planner} />

          <div className="trustbar reveal">
            <span>🚄 <b>Transport included</b> — KTX, bus &amp; flight options</span>
            <span>🧭 <b>Route-optimized</b> by real distance</span>
            <span>📤 <b>Share</b> to KakaoTalk, WhatsApp, LINE</span>
            <span>🌐 <b>20 languages</b></span>
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
            <a className="btn ghost" href={`/${locale}/destinations/`}>{m.dest.browseAll} →</a>
          </div>
          <div className="grid g4">
            {["myeongdong", "n-seoul-tower", "gyeongbokgung", "bukhansan"].map((slug) => {
              const d = destData.items[slug];
              const f = d.factId ? fact(d.factId) : null;
              const stat = f && f.value ? Object.values(f.value)[0] : null;
              return (
                <a className="card" key={slug} href={`/${locale}/destinations/${slug}/`}>
                  <div className="thumb" style={{ background: d.grad }}>{d.icon}
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
              <h2>Food — taste it, then make it</h2>
              <p>Find where to eat, and book a hands-on class to cook it yourself. Prices shown only when verified.</p>
            </div>
          </div>
          <h4 style={{ fontFamily: "var(--mono)", color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".04em", margin: "0 0 12px" }}>🍜 Where to eat</h4>
          <div className="grid g4">
            {[
              { t: "Korean BBQ", d: "Samgyeopsal & galbi — grill at your table.", g: "linear-gradient(135deg,#d1495b,#f07167)", ic: "🥩" },
              { t: "Myeongdong Night Market", d: "Tteokbokki, hotteok, egg bread.", g: "linear-gradient(135deg,#e8973a,#f4c04e)", ic: "🌭" },
              { t: "Halal & Vegetarian", d: "Certified spots near Itaewon & Gangnam.", g: "linear-gradient(135deg,#0FA08C,#54c9a8)", ic: "🥗" },
              { t: "Seongsu Cafes", d: "Seoul's coolest coffee & dessert street.", g: "linear-gradient(135deg,#8367c7,#b18fe0)", ic: "☕" },
            ].map((c) => (
              <article className="card" key={c.t}>
                <div className="thumb" style={{ background: c.g }}>{c.ic}</div>
                <div className="cbody"><h3>{c.t}</h3><p>{c.d}</p></div>
              </article>
            ))}
          </div>
          <h4 style={{ fontFamily: "var(--mono)", color: "var(--faint)", textTransform: "uppercase", letterSpacing: ".04em", margin: "26px 0 12px" }}>🥢 Making experiences</h4>
          <div className="grid g4">
            {[
              { t: "Kimchi Making", d: "Make & pack your own — take it home.", g: "linear-gradient(135deg,#d1495b,#ef767a)", ic: "🥬" },
              { t: "Bibimbap & Bulgogi", d: "Cook a full Korean meal with a chef.", g: "linear-gradient(135deg,#e8973a,#f2b950)", ic: "🍲" },
              { t: "Tteok Rice Cake", d: "Shape colorful rice cakes, tea included.", g: "linear-gradient(135deg,#0FA08C,#5ccbb2)", ic: "🍡" },
              { t: "Makgeolli Brewing", d: "Brew & taste Korean rice wine.", g: "linear-gradient(135deg,#8367c7,#a98fe0)", ic: "🍶" },
            ].map((c) => (
              <article className="card" key={c.t}>
                <div className="thumb" style={{ background: c.g }}>{c.ic}
                  <span className="pill" style={{ position: "absolute", bottom: 12, left: 12, background: "var(--amber-soft)", color: "var(--amber)" }}>Hands-on class</span>
                </div>
                <div className="cbody"><h3>{c.t}</h3><p>{c.d}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS (by category & language) ===== */}
      <section className="reviews" id="reviews">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">From travelers like you</span>
              <h2>Reviews, sorted by category & language</h2>
              <p>Real experiences shown in your own language first. (Sample entries — real reviews come from the review pipeline.)</p>
            </div>
          </div>
          <div className="grid g3">
            {[
              { n: "Aiko T.", loc: "Tokyo, Japan · 3-day trip", av: "#3B4CE0", flag: "🇯🇵 日本語", cat: "🥢 Food experience", catBg: "var(--amber-soft)", catC: "var(--amber)", body: "キムチ作り体験、最高でした！英語のガイドも丁寧で、作ったキムチを持ち帰れます。" },
              { n: "Marco B.", loc: "Milan, Italy · solo", av: "#0FA08C", flag: "🇮🇹 Italiano", cat: "🥾 Destination", catBg: "var(--jade-soft)", catC: "var(--jade)", body: "Bukhansan è stata la sorpresa del viaggio. Sentiero ben segnalato, vista su tutta Seoul." },
              { n: "Somchai P.", loc: "Bangkok, Thailand", av: "#FF3E6C", flag: "🇹🇭 ไทย", cat: "🎤 K-Culture", catBg: "var(--accent-soft)", catC: "var(--accent)", body: "ตามรอยซีรีส์และไปคอนเสิร์ต K-pop ผ่านลิงก์ kpophub จองง่ายมาก แนะนำเลยค่ะ" },
            ].map((r) => (
              <article className="rev-card" key={r.n}>
                <div className="rev-top">
                  <span className="avatar" style={{ background: r.av }}>{r.n[0]}</span>
                  <div className="who"><b>{r.n}</b><div className="sub">{r.loc}</div></div>
                  <span className="langflag">{r.flag}</span>
                </div>
                <span className="rev-cat" style={{ background: r.catBg, color: r.catC }}>{r.cat}</span>
                <div className="stars">★★★★★</div>
                <p>{r.body}</p>
              </article>
            ))}
          </div>
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
            <a className="btn ghost" href="https://kpophub.kr" target="_blank" rel="noopener noreferrer">🎫 Concerts on kpophub.kr →</a>
          </div>
          <SpotifyKpop labels={m.spotify} />
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section id="map" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Find your way</span>
              <h2>Search on your map of choice</h2>
              <p>Search any address or place on Naver or Kakao maps, right here.</p>
            </div>
          </div>
          <MapExplorer labels={m.map} />
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
            <h5>Plan</h5>
            <a href="#plan">Plan Trip</a><a href="#planner">AI Planner</a><a href="#dest">Destinations</a><a href="#food">Food</a>
          </div>
          <div>
            <h5>Discover</h5>
            <a href="#kculture">K-Culture</a><a href="https://kpophub.kr">Concerts (kpophub.kr)</a><a href="#reviews">Reviews</a><a href="#help">Help & Safety</a>
          </div>
          <div>
            <h5>Info</h5>
            <a href="#help">Visa & K-ETA</a><a href="#help">Emergency</a><a href="#help">Embassies</a>
          </div>
        </div>
        <div className="note">{m.footer.disclaimer}</div>
      </footer>
    </>
  );
}
