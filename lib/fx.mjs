// Live FX rates for the budget calculator. Base = KRW, so rates[CODE] is exactly
// "foreign currency per 1 KRW" — the value the calculator's rate field expects.
// Keyless daily endpoint; cached in localStorage for 12h; on any failure we fall
// back to the last cache, and the calculator falls back to manual entry. Rates
// fluctuate and are mid-market — never presented as a fixed fact (see rateNote).
const KEY = 'kth_fx_v1';
const MAX_AGE = 12 * 3600 * 1000;
const ENDPOINT = 'https://open.er-api.com/v6/latest/KRW';

function readCache() {
  try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && c.rates ? c : null; }
  catch { return null; }
}

export async function fetchRates() {
  const cached = readCache();
  if (cached && Date.now() - cached.fetchedAt < MAX_AGE) return cached;
  try {
    const r = await fetch(ENDPOINT);
    const j = r.ok ? await r.json() : null;
    if (j && j.result === 'success' && j.rates) {
      const data = { rates: j.rates, updated: j.time_last_update_utc, fetchedAt: Date.now() };
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* unavailable storage */ }
      return data;
    }
  } catch { /* offline / blocked */ }
  return cached; // stale cache if we have one, otherwise null → manual entry
}
