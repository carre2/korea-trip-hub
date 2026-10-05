"use client";
import { usePathname } from 'next/navigation';
import PeekMascot from './PeekMascot';
import TravelIcon from './TravelIcon';

const categories = {
  destinations: ['cat', 'explore'], food: ['bear', 'food'], guides: ['bunny', 'weather'],
  itinerary: ['bear', 'explore'], stay: ['cat', 'stay'], kpop: ['bunny', 'activities'],
  festivals: ['bunny', 'activities'], plan: ['bear', 'airport'], visa: ['bunny', 'visa'],
};

export default function CategoryCompanion({ titles }) {
  const pathname = usePathname();
  const [, , category, topic] = (pathname || '').split('/');
  const friend = categories[category];
  // Emergency and legal notices keep their direct, undecorated presentation.
  if (!friend || (category === 'plan' && topic === 'help')) return null;
  const isEntry = category === 'visa' || (category === 'plan' && topic === 'visa');
  const [animal, icon] = isEntry ? categories.visa : friend;
  return <div className="category-companion wrap" data-category={category} aria-hidden="true">
    <div className={`category-companion-box travel-has-peek category-companion-${animal}`}>
      <PeekMascot animal={animal}/><TravelIcon name={icon} compact/>
      <span>{titles[isEntry ? 'visa' : category]}</span><span className="category-confetti">🌷 ✨</span>
    </div>
  </div>;
}
