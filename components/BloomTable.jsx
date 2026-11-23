// Cherry-blossom guide: real KMA bloom dates + last season's festival dates.
// Every date comes from VERIFIED facts (bloom-*) in data/facts.json; copy lives
// in data/bloom-ui.json. Renders nothing if any fact is missing/unverified.
import copyAll from "../data/bloom-ui.json";
import { fact } from "../lib/facts";
import { klookSearch } from "../lib/booking";

const CITIES = ["seoul", "busan", "jeju", "daegu", "daejeon", "gangneung", "changwon"];
const FESTS = ["jinhae", "yeouido", "seokchon"];

function fmt(locale, year, md) {
  if (!md) return "—";
  const [m, d] = md.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, m - 1, d)));
}

export default function BloomTable({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  const normals = fact("bloom-kma-normals");
  const y25 = fact("bloom-observed-2025");
  const y26 = fact("bloom-observed-2026");
  const fc = fact("bloom-forecast-source");
  const fests = fact("bloom-festivals-2026");
  if (!normals || !y25 || !y26) return null;
  const n = normals.value.first;
  const fcDate = fc ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(fc.value.last_release + "T00:00:00Z")) : null;

  return (
    <section className="gv-sec bloom-table" id="bloom-dates">
      <h2>{t.title}</h2>
      <p>{t.intro}</p>
      <div className="bloom-scroll">
        <table>
          <thead>
            <tr><th scope="col">{t.hCity}</th><th scope="col">{t.hNormal}</th><th scope="col">{t.h2025}</th><th scope="col">{t.h2026}</th><th scope="col">{t.h2026full}</th></tr>
          </thead>
          <tbody>
            {CITIES.map((c) => (
              <tr key={c}>
                <th scope="row">{t.cities[c]}</th>
                <td>{fmt(locale, 2020, n[c])}</td>
                <td>{fmt(locale, 2025, y25.value[c]?.[0])}</td>
                <td>{fmt(locale, 2026, y26.value[c]?.[0])}</td>
                <td>{fmt(locale, 2026, y26.value[c]?.[1])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="bloom-note">{t.def}</p>
      {fcDate && <p className="bloom-note">📅 {t.forecast.replace("{date}", fcDate)}</p>}

      {fests && (
        <>
          <h3>{t.festTitle}</h3>
          <ul>
            {FESTS.map((f) => (
              <li key={f}>{t.fest[f]}: {fmt(locale, 2026, fests.value[f][0])} – {fmt(locale, 2026, fests.value[f][1])}</li>
            ))}
          </ul>
          <p className="bloom-note">{t.tba}</p>
        </>
      )}

      <div data-aff-placement="cherry-blossom">
        <a className="btn preflight-cta bloom-cta" href={klookSearch("Korea cherry blossom tour")} target="_blank" rel="sponsored nofollow noopener noreferrer">🌸 {t.cta} ↗</a>
        <p className="preflight-disc">ⓘ {t.disc}</p>
      </div>

      <p className="entry-reviewed">
        {t.checked} · <time dateTime={y26.verified}>{y26.verified}</time> · <a href={normals.source} target="_blank" rel="noopener noreferrer">{t.src} ↗</a>
      </p>
    </section>
  );
}
