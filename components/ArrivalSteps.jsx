"use client";
import { track } from '../lib/analytics';
export default function ArrivalSteps({ locale, m, placement = 'article' }) {
  const t = m.experience;
  return <aside className="arrival-next" data-placement={placement} aria-label={t.nextTitle}>
    <div><span className="eyebrow">{t.firstDay}</span><h2>{t.nextTitle}</h2><p>{t.nextSub}</p></div>
    <div className="arrival-actions">
      <a className="btn" href={`/${locale}/plan/airport/`} onClick={() => track('next_step_click', { locale, target: 'airport', placement })}>{m.plan.tiles.airport.title} →</a>
      <a href={`/${locale}/plan/sim/`} onClick={() => track('next_step_click', { locale, target: 'sim', placement })}>{m.plan.tiles.sim.title} →</a>
      <a href={`/${locale}/#planner`} onClick={() => track('next_step_click', { locale, target: 'planner', placement })}>{t.checklist} →</a>
    </div>
  </aside>;
}
