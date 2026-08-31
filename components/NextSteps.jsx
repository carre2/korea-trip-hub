// "Visa sorted — now plan the rest" band. Rendered at the foot of each visa
// country page to turn the site's biggest entry point (nationality visa search)
// into the start of a full-trip funnel instead of a dead end. Labels reuse the
// already-translated plan.tiles.* strings; only the band heading + stay/itinerary
// labels are new (messages.nextSteps). The K-pop card is the kpophub funnel entry
// (our /kpop guide links out to kpophub.kr for live concerts).
export default function NextSteps({ locale, m }) {
  const ns = m?.nextSteps || {};
  const tiles = m?.plan?.tiles || {};
  const L = (p) => `/${locale}/${p}/`;

  const items = [
    { icon: "✈️", title: tiles.airport?.title || "Airport → City", sub: tiles.airport?.sub || "From the airport", href: L("plan/airport") },
    { icon: "🚇", title: tiles.transit?.title || "Getting Around", sub: tiles.transit?.sub || "Subway, bus & rail", href: L("plan/transit") },
    { icon: "📱", title: tiles.sim?.title || "SIM / eSIM / Wi-Fi", sub: tiles.sim?.sub || "Stay connected", href: L("plan/sim") },
    { icon: "💳", title: tiles.money?.title || "Money & Payment", sub: tiles.money?.sub || "Cash & cards", href: L("plan/money") },
    { icon: "🏨", title: ns.stay || "Where to stay", sub: ns.staySub || "Best areas & neighborhoods", href: L("stay") },
    { icon: "🗺️", title: ns.itinerary || "Ready-made itineraries", sub: ns.itinerarySub || "3–7 day routes you can copy", href: L("itinerary") },
  ];
  const kpop = { icon: "🎤", title: tiles.kpop?.title || "K-pop & Concerts", sub: tiles.kpop?.sub || "Venues, tickets & idol hotspots", href: L("kpop") };

  return (
    <section className="nextsteps" aria-label={ns.title || "Plan the rest of your trip"}>
      <div className="ns-head">
        <h2>{ns.title || "Visa sorted? Now plan the rest of your trip"}</h2>
        <p>{ns.sub || "Arrival, getting around, where to stay, and what to do — the rest of your Korea trip, all here."}</p>
      </div>
      <div className="ns-grid">
        {items.map((it) => (
          <a key={it.href} className="ns-card" href={it.href}>
            <span className="ns-ic" aria-hidden="true">{it.icon}</span>
            <span className="ns-t">{it.title}</span>
            <span className="ns-s">{it.sub}</span>
          </a>
        ))}
        <a className="ns-card ns-kpop" href={kpop.href}>
          <span className="ns-ic" aria-hidden="true">{kpop.icon}</span>
          <span className="ns-t">{kpop.title}</span>
          <span className="ns-s">{kpop.sub}</span>
          <span className="ns-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
