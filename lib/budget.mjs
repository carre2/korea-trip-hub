export const CURRENCIES = ['KRW','IDR','VND','THB','PHP','MYR','SGD','USD','TWD','HKD','JPY','EUR'];
export function budgetCurrency(locale, country) {
  const market = {indonesia:'IDR',vietnam:'VND',thailand:'THB',philippines:'PHP',malaysia:'MYR',singapore:'SGD',taiwan:'TWD'};
  const language = {id:'IDR',vi:'VND',th:'THB',ms:'MYR',ja:'JPY','zh-TW':'TWD',ko:'KRW',fr:'EUR',es:'EUR'};
  return market[country] || language[locale] || 'USD';
}
export function calculateBudget(values, rate, currency) {
  if (!CURRENCIES.includes(currency) || values.some(v => v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 1e12))) return null;
  if (values.every(v => v === '')) return null;
  const total = values.reduce((sum, v) => sum + Number(v), 0);
  const exchange = currency === 'KRW' ? 1 : Number(rate);
  if (!Number.isFinite(exchange) || exchange <= 0 || exchange > 1e9) return null;
  const converted = total * exchange;
  return Number.isFinite(converted) ? {total, converted} : null;
}
