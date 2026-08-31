"use client";
import { useState } from "react";

// Interactive "find your country" picker for the visa hub. Data comes from the
// already-localized countryGuides list (code/flag/name/note), so no new content
// to translate — only the 3 chrome labels (messages.visaFinder). Picking a
// nationality reveals its verdict note + a link to the full A-to-Z guide; this
// is an on-page tool (dwell-time + a genuine utility signal), not a dead grid.
export default function VisaFinder({ locale, items = [], labels = {}, moreText }) {
  const [code, setCode] = useState("");
  const sel = items.find((i) => i.code === code);

  return (
    <section className="visafinder" aria-label={labels.label || "Find your country"}>
      <label className="vf-label" htmlFor="vf-select">{labels.label || "Which country are you from?"}</label>
      <div className="vf-row">
        <select
          id="vf-select"
          className="vf-select"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
          <option value="">{labels.placeholder || "Select your nationality…"}</option>
          {items.map((i) => (
            <option key={i.code} value={i.code}>{i.flag} {i.name}</option>
          ))}
        </select>
      </div>

      {sel ? (
        <div className={`vf-result ${sel.group === "need" ? "vf-need" : "vf-free"}`} role="status">
          <span className="vf-flag" aria-hidden="true">{sel.flag}</span>
          <span className="vf-txt">
            <b>{sel.name}</b>
            <em>{sel.note}</em>
          </span>
          <a className="vf-cta" href={`/${locale}/visa/${sel.code}/`}>{labels.cta || "View full guide"} →</a>
        </div>
      ) : (
        moreText && <p className="vf-more">{moreText}</p>
      )}
    </section>
  );
}
