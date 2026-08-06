// Reusable booking call-to-action. Renders a partner link with the correct
// rel="sponsored nofollow" (SEO-safe) and an optional affiliate disclosure.
// No client JS; safe to use inside server OR client components.
import { withAff, DISCLOSURE } from "../lib/booking";

export default function BookCTA({ partner, url, icon = "🎟️", label, sub, disclose = false }) {
  const href = withAff(url, partner);
  const pretty = partner ? partner.charAt(0).toUpperCase() + partner.slice(1) : "partner";
  return (
    <div className="bookcta">
      <a className="bookcta-btn" href={href} target="_blank" rel="sponsored nofollow noopener">
        <span className="bookcta-ic">{icon}</span>
        <span className="bookcta-txt">
          <b>{label}</b>
          {sub && <em>{sub}</em>}
        </span>
        <span className="bookcta-go">Book on {pretty} ↗</span>
      </a>
      {disclose && <p className="bookcta-disc">ⓘ {DISCLOSURE}</p>}
    </div>
  );
}
