const symbols = {
  visa: '🛂', airport: '🛬', explore: '🗺️', transit: '🚆', sim: '📱',
  money: '👛', weather: '🌤️', help: '🛟', saved: '💗', checklist: '📝',
  flights: '✈️', stay: '🛏️', transport: '🚆', food: '🍜', activities: '🎟️',
};

// Decorative only: the adjacent localized label remains the accessible name.
export default function TravelIcon({ name, compact = false }) {
  return <span className={`travel-icon${compact ? ' travel-icon-small' : ''}`} aria-hidden="true">{symbols[name] || '✨'}</span>;
}
