export const TRIP_KEY = 'kth_trip_v1';
export const CHECKLIST_IDS = ['visa', 'airport', 'sim', 'money', 'stay'];
// Store stable identifiers only, never passport information or hotel addresses.
export function normalizeTrip(value, routes) {
  if (!value || value.v !== 1 || typeof value.route !== 'string' || !Object.hasOwn(routes, value.route)) return null;
  const validStops = new Set(routes[value.route].plan.flatMap((day) => day.stops.map((_, i) => `${day.n}-${i}`)));
  if (!Array.isArray(value.excluded) || value.excluded.length > validStops.size || value.excluded.some((id) => !validStops.has(id))) return null;
  if(value.order !== undefined && (!Array.isArray(value.order) || value.order.length > validStops.size || value.order.some(id=>!validStops.has(id)))) return null;
  return { ...(value.order ? {order:[...new Set(value.order)]} : {}), v: 1, route: value.route, excluded: [...new Set(value.excluded)], checked: CHECKLIST_IDS.filter((id) => Array.isArray(value.checked) && value.checked.includes(id)) };
}
export function encodeTrip(trip) { return trip.order ? `2.${trip.route}.${trip.excluded.join(',')}.${trip.order.join(',')}` : `1.${trip.route}.${trip.excluded.join(',')}`; }
export function decodeTrip(text, routes) {
  if (typeof text !== 'string' || text.length > 2000) return null;
  const parts = text.split('.');
  if (!((parts.length === 3 && parts[0] === '1') || (parts.length === 4 && parts[0] === '2'))) return null;
  return normalizeTrip({ ...(parts[0]==='2'?{order:parts[3]?parts[3].split(','):[]}:{}), v: 1, route: parts[1], excluded: parts[2] ? parts[2].split(',') : [], checked: [] }, routes);
}
