"use client";
import { useId, useState } from 'react';
import labels from '../data/budget-ui.json';
import { CURRENCIES, calculateBudget, budgetCurrency } from '../lib/budget.mjs';
import { track } from '../lib/analytics';
const fields = ['flights','stay','transport','food','activities'];
export default function BudgetCalculator({locale, country}) {
  const t = labels[locale] || labels.en, id = useId();
  const [values, setValues] = useState(fields.map(() => ''));
  const [currency, setCurrency] = useState(budgetCurrency(locale, country));
  const [rate, setRate] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  function clearResult() { setResult(null); setError(false); }
  function calculate(e) {
    e.preventDefault(); const next = calculateBudget(values, rate, currency);
    setResult(next); setError(!next);
    if (next) track('budget_calculate', {locale,currency});
  }
  const money = (value, code) => new Intl.NumberFormat(locale, {style:'currency',currency:code,maximumFractionDigits:2}).format(value);
  return <section id="budget" className="budget-calculator" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{t.title}</h2><p>{t.note}</p>
    <form onSubmit={calculate}>
      <div className="budget-fields">{fields.map((field, i) => <label key={field} htmlFor={`${id}-${field}`}>{t[field]} (KRW)
        <input id={`${id}-${field}`} type="number" min="0" max="1000000000000" step="any" inputMode="decimal" value={values[i]} onChange={e => {setValues(values.map((v,j) => i === j ? e.target.value : v)); clearResult();}} />
      </label>)}</div>
      <div className="budget-fields"><label htmlFor={`${id}-currency`}>{t.currency}<select id={`${id}-currency`} value={currency} onChange={e => {setCurrency(e.target.value); setRate(''); clearResult();}}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select></label>
      {currency !== 'KRW' && <label htmlFor={`${id}-rate`}>{t.rate} {currency}<input id={`${id}-rate`} aria-describedby={`${id}-rate-note`} type="number" min="0.000000001" max="1000000000" step="any" inputMode="decimal" required value={rate} onChange={e => {setRate(e.target.value); clearResult();}} /></label>}</div>
      {currency !== 'KRW' && <p id={`${id}-rate-note`}>{t.rateNote}</p>}
      <div className="share-actions"><button className="btn" type="submit">{t.calculate}</button><button className="btn ghost" type="button" onClick={() => {setValues(fields.map(() => ''));setRate('');clearResult();}}>{t.reset}</button></div>
      <div role="status" aria-live="polite">{error && <p>{t.invalid}</p>}{result && <p className="budget-total"><strong>{t.total}: {money(result.total,'KRW')}</strong>{currency !== 'KRW' && <span> ≈ {money(result.converted,currency)}</span>}</p>}</div>
    </form><a href={`/${locale}/#planner`}>{t.planner} →</a>
  </section>;
}
