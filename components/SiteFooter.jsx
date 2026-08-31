// Site-wide slim footer (server component). Rendered on every locale page via the
// locale layout, so the legal / trust links and the affiliate disclosure are reachable
// from anywhere — not just the home page.
import { getMessages } from "../lib/i18n";
import { legalSlugs, legalFor } from "../lib/legal";

export default function SiteFooter({ locale }) {
  const m = getMessages(locale);
  const f = m.footer || {};
  const nav = f.legalNav || {};
  const L = legalFor(locale);
  return (
    <footer className="sitefoot">
      <div className="wrap sitefoot-in">
        <div className="sitefoot-brand">
          <span className="mark">◆</span> Korea<b>Trip</b>Hub
        </div>
        <nav className="sitefoot-links" aria-label={f.legalNavLabel || "Legal"}>
          {legalSlugs().map((s) => (
            <a key={s} href={`/${locale}/legal/${s}/`}>
              {nav[s] || (L.pages[s] && L.pages[s].title) || s}
            </a>
          ))}
        </nav>
        <p className="sitefoot-family">
          <a href="https://kpophub.kr" rel="noopener">
            🎤 {m.nav?.kculture || "K-Culture"} — kpophub.kr →
          </a>
        </p>
        <p className="sitefoot-aff">
          {f.affiliateLine || "Some links are affiliate links — we may earn a commission at no extra cost to you."}
        </p>
        <p className="sitefoot-rights">
          {f.rights || "© 2026 Korea Trip Hub — an independent travel guide."}
        </p>
      </div>
    </footer>
  );
}
