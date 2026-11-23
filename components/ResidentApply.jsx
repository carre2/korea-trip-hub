import copy from "../data/resident-apply.json";
import { fact } from "../lib/facts";

// Applying for a Korean tourist visa while living in Taiwan or Hong Kong.
// GSC (2026-11) shows most zh-TW visa traffic comes from Taiwan/Hong Kong readers
// asking about Indonesian/Philippine/Vietnamese/Chinese passports, so this answers
// "can I apply here?" with the two offices' official rules. Renders only when both
// facts are VERIFIED, for locales that have copy, on visa-required country pages.
export default function ResidentApply({ locale, country }) {
  const c = copy[locale];
  if (!c || !copy.countries.includes(country)) return null;
  const tw = fact("visa-resident-taipei-c39");
  const hk = fact("visa-resident-hongkong-c39");
  if (!tw || !hk) return null;

  return (
    <section className="entry-guidance resident-apply" id="apply-in-taiwan-hongkong">
      <h2>{c.title}</h2>
      <p>{c.intro}</p>

      <h3>{c.twTitle}</h3>
      <ul>{c.tw.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <h3>{c.hkTitle}</h3>
      <p className="resident-apply-warn"><strong>⚠️ {c.hkWarn}</strong></p>
      <ul>{c.hk.map((t, i) => <li key={i}>{t}</li>)}</ul>

      <p>{c.fallback}</p>
      <p className="entry-reviewed">
        {c.checked} · <time dateTime={tw.verified}>{tw.verified}</time> ·{" "}
        <a href={tw.source} target="_blank" rel="noopener noreferrer">{c.twLink} ↗</a> ·{" "}
        <a href={hk.source} target="_blank" rel="noopener noreferrer">{c.hkLink} ↗</a>
      </p>
    </section>
  );
}
