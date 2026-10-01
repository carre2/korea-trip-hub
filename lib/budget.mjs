export const CURRENCIES = ['KRW','IDR','VND','THB','PHP','MYR','SGD','USD','TWD','HKD','JPY','EUR'];
export function calculateBudget(values, rate, currency) {
  if (!CURRENCIES.includes(currency) || values.some(v => v !== '' && (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 1e12))) return null;
  if (values.every(v => v === '')) return null;
  const total = values.reduce((sum, v) => sum + Number(v), 0);
  const exchange = currency === 'KRW' ? 1 : Number(rate);
  if (!Number.isFinite(exchange) || exchange <= 0 || exchange > 1e9) return null;
  const converted = total * exchange;
  return Number.isFinite(converted) ? {total, converted} : null;
}
