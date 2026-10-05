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

export function shareMessage(title, url) {
  return `${title}\n\n${url}`;
}

// Encode the complete selected itinerary URL, including its query and fragment.
// These open a composer/recipient picker; they do not send a message.
export function socialShareUrl(service, title, url) {
  const message = encodeURIComponent(shareMessage(title, url));
  switch (service) {
    case 'whatsapp': return `https://wa.me/?text=${message}`;
    case 'line': return `https://line.me/R/share?text=${message}`;
    case 'telegram': return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    case 'gmail': return `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(title)}&body=${message}`;
    default: return null;
  }
}
