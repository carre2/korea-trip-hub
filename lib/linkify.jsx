// Auto-link URLs inside guide TEXT so writers can just type them in prose.
//  - Bare official domains / full URLs -> external link (e.g. "apply at k-eta.go.kr").
//  - Markdown internal links "[label](/plan/money/)" -> in-site link, ONLY when a
//    `locale` is passed; the leading "/" path is prefixed with the current locale
//    ("/plan/money/" -> "/en/plan/money/"). Existing callers that pass no locale keep
//    the exact previous behavior (external links only), so nothing else changes.
//
// Matches http(s) URLs and bare domains ending in the TLDs Korea-travel content uses.
const URL_RE = /((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:go\.kr|or\.kr|co\.kr|ne\.kr|re\.kr|gov\.in|gov\.ph|go\.id|com|net|org|kr)(?:\/[^\s)]*)?)/gi;
// Markdown internal link: [visible label](/root-relative/path/)
const MD_RE = /\[([^\]\n]+)\]\((\/[a-z0-9][a-z0-9/_-]*)\)/gi;

/** Returns React children: the string split so recognized URLs (and, when a locale is
 *  given, [label](/path) internal links) become <a> links. */
export function linkify(text, locale) {
  if (typeof text !== "string" || !text) return text;

  // Collect non-overlapping tokens (internal markdown links first when locale is set,
  // then external URLs that don't overlap them), and render in document order.
  const tokens = [];
  if (locale) {
    let m; MD_RE.lastIndex = 0;
    while ((m = MD_RE.exec(text)) !== null) {
      tokens.push({ start: m.index, end: m.index + m[0].length, type: "int", label: m[1], path: m[2] });
    }
  }
  let u; URL_RE.lastIndex = 0;
  while ((u = URL_RE.exec(text)) !== null) {
    const start = u.index, end = start + u[0].length;
    if (start > 0 && text[start - 1] === "@") continue;              // not inside an email
    if (tokens.some((t) => start < t.end && end > t.start)) continue; // inside a markdown link's URL
    tokens.push({ start, end, type: "ext", raw: u[0] });
  }
  if (!tokens.length) return text;
  tokens.sort((a, b) => a.start - b.start);

  const out = [];
  let last = 0, key = 0;
  for (const t of tokens) {
    if (t.start < last) continue; // safety: skip any residual overlap
    if (t.start > last) out.push(text.slice(last, t.start));
    if (t.type === "int") {
      const href = `/${locale}${t.path}`;
      out.push(<a key={key++} href={href}>{t.label}</a>);
      last = t.end;
    } else {
      let raw = t.raw;
      const trailMatch = raw.match(/[.,;:!?)\]]+$/);
      const trail = trailMatch ? trailMatch[0] : "";
      if (trail) raw = raw.slice(0, -trail.length);
      if (!raw) { out.push(t.raw); last = t.end; continue; }
      const href = raw.startsWith("http") ? raw : `https://${raw}`;
      out.push(<a key={key++} href={href} target="_blank" rel="noopener noreferrer">{raw}</a>);
      if (trail) out.push(trail);
      last = t.end;
    }
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
