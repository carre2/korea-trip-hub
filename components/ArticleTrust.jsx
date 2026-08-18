// "About this page" trust block for content articles (server component). Shows who
// wrote/checked it, when it was last reviewed, how facts are sourced, a correction
// link, and optional related internal links. Reuses the reviewed date (lib/seo
// REVIEWED) and the translated legal-nav labels — no per-article dates are invented.
import { getMessages } from "../lib/i18n";
import { REVIEWED } from "../lib/seo";

export default function ArticleTrust({ locale, related = [] }) {
  const m = getMessages(locale);
  const t = m.articleTrust || {};
  const nav = (m.footer && m.footer.legalNav) || {};
  return (
    <aside className="artrust" aria-label={t.about || "About this page"}>
      <div className="artrust-head">
        <span className="artrust-by">🖊 {t.by || "By"} <b>Korea Trip Hub</b></span>
        <a className="artrust-link" href={`/${locale}/legal/editorial/`}>{nav.editorial || "Editorial policy"}</a>
        <span className="artrust-rev">🔄 {t.reviewed || "Reviewed"}: {REVIEWED.label}</span>
      </div>
      <p className="artrust-note">
        {t.verifiedNote || "Key facts are checked against official government and operator sources."}{" "}
        {t.confirmNote || "Rules and prices can change — confirm with the official source before you travel or book."}
      </p>
      <div className="artrust-actions">
        <a className="artrust-report" href={`/${locale}/legal/contact/`}>🛠 {t.reportError || "Report an error"}</a>
      </div>
      {related.length > 0 && (
        <div className="artrust-related">
          <span className="artrust-rel-lbl">{t.related || "Related"}</span>
          {related.map((r) => (
            <a key={r.href} href={r.href}>{r.label}</a>
          ))}
        </div>
      )}
    </aside>
  );
}
