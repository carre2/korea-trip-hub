export const PLACES_KEY = 'kth_places_v1';
export function normalizePlaces(value, catalog) {
  if (!Array.isArray(value) || value.length > 80) return [];
  return [...new Set(value.filter(id => typeof id === 'string' && Object.hasOwn(catalog, id)))];
}
export function decodePlaces(text, catalog) {
  return typeof text === 'string' && text.length <= 4000 ? normalizePlaces(text.split(','), catalog) : [];
}
// Shared selections take precedence over local storage, including an empty list.
export function resolvePlaces(search, readStored, catalog) {
  const query = new URLSearchParams(search);
  if (query.has('places')) return { shared: true, ids: decodePlaces(query.get('places'), catalog) };
  return { shared: false, ids: normalizePlaces(JSON.parse(readStored() || '[]'), catalog) };
}
