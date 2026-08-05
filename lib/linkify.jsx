// Auto-link bare official domains/URLs that appear inside guide TEXT
// (e.g. "apply at k-eta.go.kr" -> a real link). Used across the guide
// components so writers can just type the domain in prose.
//
// Matches http(s) URLs and bare domains ending in the TLDs Korea-travel
// content actually uses. Trailing sentence punctuation is kept as text.
const URL_RE = /((?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:go\.kr|or\.kr|co\.kr|ne\.kr|re\.kr|gov\.in|gov\.ph|go\.id|com|net|org|kr)(?:\/[^\s)]*)?)/gi;

/** Returns React children: the string split so recognized URLs become <a> links. */
export function linkify(text) {
  if (typeof text !== "string" || !text) return text;
  const out = [];
  let last = 0, m, key = 0;
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text)) !== null) {
    let raw = m[0];
    // don't linkify inside an email address
    if (m.index > 0 && text[m.index - 1] === "@") continue;
    // strip trailing punctuation from the match (kept as plain text)
    const trailMatch = raw.match(/[.,;:!?)\]]+$/);
    const trail = trailMatch ? trailMatch[0] : "";
    if (trail) raw = raw.slice(0, -trail.length);
    if (!raw) continue;
    if (m.index > last) out.push(text.slice(last, m.index));
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    out.push(
      <a key={key++} href={href} target="_blank" rel="noopener noreferrer">{raw}</a>
    );
    if (trail) out.push(trail);
    last = m.index + m[0].length;
  }
  if (last === 0) return text; // no matches — return the plain string
  if (last < text.length) out.push(text.slice(last));
  return out;
}
