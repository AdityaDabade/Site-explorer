import { useState } from 'react';
import { REGION_FILTERS } from '../../../constants/homeData';
import NearbyPlaces from '../../components/home/NearbyPlaces'

/**
 * TrendingPlacesSection — filtered, paginated grid of trending places.
 *
 * Props:
 *   places      {array}    Normalized place objects
 *   loading     {boolean}
 *   onShowAll   {function} navigates to /nearby
 *   onOpenPlace {function} called with place object
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
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]
    );

  return (
    <section className="section-sm">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="section-eyebrow">Discover</div>
            <h2 className="section-title">Trending right now</h2>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-[var(--c-primary)]"
            onClick={onShowAll}
          >
            Show all →
          </button>
        </div>

        {/* Region filter chips */}
        <div className="filter-chips mt-5">
          {REGION_FILTERS.map((region) => (
            <button
              key={region}
              type="button"
              className={`chip ${activeRegion === region ? 'active' : ''}`}
              onClick={() => setActiveRegion(region)}
            >
              {region}
            </button>
          ))}
        </div>

        <NearbyPlaces
          loading={loading}
          places={filteredPlaces}
          savedIds={savedIds}
          onOpenPlace={onOpenPlace}
          onToggleSave={handleToggleSave}
        />
      </div>
    </section>
  );
}
