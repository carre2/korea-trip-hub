export const PLACES_KEY = 'kth_places_v1';
export function normalizePlaces(value, catalog) {
  if (!Array.isArray(value) || value.length > 80) return [];
  return [...new Set(value.filter(id => typeof id === 'string' && Object.hasOwn(catalog, id)))];
}
export function decodePlaces(text, catalog) {
  return typeof text === 'string' && text.length <= 4000 ? normalizePlaces(text.split(','), catalog) : [];
}
