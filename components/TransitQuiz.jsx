"use client";
// ⑤ Transit-pass finder. 3 questions → an honest recommendation among the same
// cards shown in the Day-1 grid, mapped to real Klook affiliate search links.
// No prices/claims (facts harness) — only each pass's characteristics.
import { useState } from 'react';
import copyAll from '../data/transit-quiz-ui.json';
import { klookSearch } from '../lib/booking';

const QUERY = { climate: 'Climate Card Seoul', tmoney: 'T-money card Korea', wowpass: 'WOWPASS Korea' };

export default function TransitQuiz({ locale }) {
  const t = copyAll[locale] || copyAll.en;
  const [ans, setAns] = useState([null, null, null]);
  const done = ans.every((a) => a !== null);
  const pick = (qi, ai) => setAns((prev) => prev.map((v, i) => (i === qi ? ai : v)));
  // Heavy use + Seoul-only → Climate Card; otherwise pay-as-you-go T-money.
  const primary = done ? (ans[0] === 1 && ans[1] === 0 ? 'climate' : 'tmoney') : null;
  // Wants to pay with a home card → add WOWPASS (prepaid + T-money built in).
  const addon = done && ans[2] === 1 ? 'wowpass' : null;

  const Rec = ({ id, label }) => {
    const p = t.pass[id];
    return (
      <div className="tquiz-rec">
        <span className="tquiz-rec-label">{label}</span>
        <h4>{p.name}</h4>
        <p>{p.why}</p>
        <a className="btn tquiz-cta" href={klookSearch(QUERY[id])} target="_blank" rel="sponsored nofollow noopener noreferrer">{t.cta}</a>
      </div>
    );
  };

  return (
    <section className="tquiz wrap" aria-label={t.title}>
      <div className="sec-head"><h2>{t.title}</h2></div>
      <p className="tquiz-intro">{t.intro}</p>
      <div className="tquiz-qs">
        {t.q.map((q, qi) => (
          <fieldset className="tquiz-q" key={qi}>
            <legend>{qi + 1}. {q.ask}</legend>
            <div className="tquiz-opts">
              {q.a.map((opt, ai) => (
                <button type="button" key={ai} className={`tquiz-opt${ans[qi] === ai ? ' is-on' : ''}`} aria-pressed={ans[qi] === ai} onClick={() => pick(qi, ai)}>{opt}</button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {done && (
        <div className="tquiz-result">
          <Rec id={primary} label={t.result} />
          {addon && <Rec id={addon} label={t.addon} />}
          <button type="button" className="tquiz-again" onClick={() => setAns([null, null, null])}>↺ {t.again}</button>
        </div>
      )}
    </section>
  );
}
