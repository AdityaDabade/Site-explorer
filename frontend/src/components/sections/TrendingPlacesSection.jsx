import { useState } from 'react';
import NearbyPlaces from '../home/NearbyPlaces';
import { REGION_FILTERS } from '../../constants/homeData';

/**
 * TrendingPlacesSection
 * "Best Destination / See all" header + region chips + vertical place cards.
 *
 * Props:
 *   places      {array}
 *   loading     {boolean}
 *   onShowAll   {function}
 *   onOpenPlace {function}
 */
export default function TrendingPlacesSection({ places, loading, onShowAll, onOpenPlace }) {
  const [activeRegion, setActiveRegion] = useState('All');
  const [savedIds, setSavedIds] = useState([]);

  const filteredPlaces =
    activeRegion === 'All'
      ? places
      : places.filter((p) =>
          `${p.region} ${p.location_name}`.toLowerCase().includes(activeRegion.toLowerCase())
        );

  const handleToggleSave = (id) =>
    setSavedIds((cur) =>
      cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]
    );

  return (
    <section className="bg-white pb-8">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span className="text-base font-bold text-gray-900">Best Destination</span>
        <button
          type="button"
          onClick={onShowAll}
          className="text-sm font-medium text-sky-500 hover:underline"
        >
          See all
        </button>
      </div>

      {/* Region filter chips */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-none">
        {REGION_FILTERS.map((region) => (
          <button
            key={region}
            type="button"
            onClick={() => setActiveRegion(region)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeRegion === region
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Cards */}
      <NearbyPlaces
        places={filteredPlaces}
        loading={loading}
        savedIds={savedIds}
        onOpenPlace={onOpenPlace}
        onToggleSave={handleToggleSave}
      />
    </section>
  );
}
