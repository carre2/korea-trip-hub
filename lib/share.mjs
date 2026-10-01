import { encodeTrip } from './trip-state.mjs';

// Share public selections only; never forward arbitrary query strings or checklist state.
export function tripShareUrl({ origin, locale, trip, places = [] }) {
  const url = new URL(`/${locale}/`, origin);
  if (trip) url.searchParams.set('trip', encodeTrip(trip));
  // An explicit empty list must not load the recipient's own saved places.
  url.searchParams.set('places', places.join(','));
  url.hash = trip ? 'planner' : 'saved-places';
  return url.href;
}
export function pageShareUrl(href) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  return url.href;
}
export function emailShareUrl(title, url) {
  return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`;
}
