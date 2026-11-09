"use client";
// Shared by the "step by step" and "map" tabs of the place-report entry:
// fetching a browse list (/api/place/browse) and rendering it as cards that open
// the report for that exact place (contentId + the service it came from).

export const BROWSE_CATS = ["sights", "festival", "food", "stay", "shopping", "course"];
export const BROWSE_WHENS = ["upcoming", "month", "next"];

export function fmtDate(d) {
  return d && d.length === 8 ? `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}` : "";
}

export function reportHref(locale, it) {
  const sp = new URLSearchParams({ q: it.title, contentId: it.id, cl: it.cl });
  return `/${locale}/report/?${sp.toString()}`;
}

// -> { ok, items, page, more } or { ok: false }
export async function fetchBrowse({ locale, region, sigungu, cat, when, page = 1 }) {
  const sp = new URLSearchParams({ locale, region: String(region), cat, page: String(page) });
  if (sigungu) sp.set("sigungu", String(sigungu));
  if (cat === "festival") sp.set("when", when || "upcoming");
  try {
    const res = await fetch(`/api/place/browse?${sp.toString()}`);
    const data = await res.json().catch(() => ({ ok: false }));
    return res.ok && data.ok ? data : { ok: false };
  } catch {
    return { ok: false };
  }
}

// list: { items, page, more } | null; status: idle | loading | ok | failed
export function ResultCards({ locale, list, status, t, badge, onMore }) {
  return (
    <>
      {status === "loading" && !list && <p className="prs-note">{t.loading}</p>}
      {status === "failed" && <p className="prs-note">{t.failed}</p>}
      {list && list.items.length === 0 && <p className="prs-note">{t.empty}</p>}
      {list && list.items.length > 0 && (
        <>
          <div className="prs-results">
            {list.items.map((it) => (
              <a className="prs-card" key={`${it.cl}-${it.id}`} href={reportHref(locale, it)}>
                <div className={`prs-thumb${it.image ? "" : " ph"}`}>
                  {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span>📷</span>}
                </div>
                <div className="prs-cbody">
                  <h3>{it.title}</h3>
                  {it.start && <p className="prs-date">🗓️ {t.period}: {fmtDate(it.start)} – {fmtDate(it.end)}</p>}
                  {it.addr && <p className="prs-addr">📍 {it.addr}</p>}
                  {it.lang === "ko" && <span className="prr-badge ref">🇰🇷 {badge.koListing}</span>}
                </div>
              </a>
            ))}
          </div>
          {list.more && onMore && (
            <button className="btn sm prs-more" type="button" disabled={status === "loading"} onClick={onMore}>
              {status === "loading" ? t.loading : t.more}
            </button>
          )}
          <p className="prs-src">{badge.source}: TourAPI</p>
        </>
      )}
    </>
  );
}
