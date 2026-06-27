import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getNearbyPlaces } from '../api/placeApi';
import { extractArray, extractMessage } from '../api/responseUtils';
import MapView from '../components/map/MapView';
import PlaceCard from '../components/tour/PlaceCard';
import { useLocationContext } from '../context/LocationContext';
import { scorePlace } from '../utils/scoreUtils';
import { normalizePlace } from '../utils/normalizePlace';

const FILTER_CHIPS = ['All', 'Monuments', 'Nature', 'Food', 'Free Entry', 'Near Me'];

/**
 * Airbnb-style explore results page with filters, map split, and mobile map sheet.
 */
export default function ExplorePage() {
  const navigate = useNavigate();
  const { location } = useLocationContext();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await getNearbyPlaces({
          lat: location.lat,
          lng: location.lng
        });
        const normalized = extractArray(response, ['places', 'items']).map(normalizePlace);
        if (isMounted) {
          setPlaces(normalized);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(extractMessage(error, 'Unable to load nearby recommendations.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [location]);

  const results = useMemo(() => {
    if (!location) {
      return [];
    }

    let filtered = places.map((place) => ({
      ...place,
      score: scorePlace(place, location.lat, location.lng, {
        interests: activeChip !== 'All' ? [activeChip] : []
      })
    }));

    if (activeChip === 'Free Entry') {
      filtered = filtered.filter((place) => Number(place.price || 0) === 0);
    } else if (activeChip === 'Near Me') {
      filtered = filtered.filter((place) => Number(place.distance || 0) <= 3);
    } else if (activeChip !== 'All') {
      filtered = filtered.filter((place) =>
        `${place.category} ${place.type}`.toLowerCase().includes(activeChip.toLowerCase())
      );
    }

    if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === 'distance') {
      filtered = [...filtered].sort((a, b) => Number(a.distance || 0) - Number(b.distance || 0));
    } else {
      filtered = [...filtered].sort((a, b) => b.score - a.score);
    }

    return filtered;
  }, [activeChip, location, places, sortBy]);

  const mapPanel = (
    <div className="sticky top-[96px] overflow-hidden rounded-[var(--r-xl)] border border-[var(--c-border)] bg-white shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Map View</p>
          <p className="mt-1 font-semibold">See places around you</p>
        </div>
        <span className="badge badge-teal">{results.length} pins</span>
      </div>
      <div className="h-[calc(100vh-170px)] min-h-[620px]">
        <MapView
          center={location || { lat: 20.5937, lng: 78.9629 }}
          places={results}
          userLocation={location}
          onMarkerClick={(place) => navigate(`/place/${place.id}`)}
          zoom={location ? 13 : 5}
        />
      </div>
    </div>
  );

  return (
    <div className="section-sm">
      <div className="container">
        <div className="sticky top-16 z-30 border-b border-[var(--c-border)] bg-[var(--c-bg)] py-4 md:top-20">
          <div className="filter-chips">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip ${activeChip === chip ? 'active' : ''}`}
                onClick={() => setActiveChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" className="btn-outline btn-sm">
                ☰ Filters
              </button>
              <button type="button" className="btn-outline btn-sm hide-mobile" onClick={() => setMobileMapOpen(true)}>
                🗺 Map
              </button>
            </div>
            <div className="urgency-tag">🔥 18 people looking at this right now</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
          <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="card card-bordered hidden h-fit p-5 xl:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--c-text-secondary)]">Filters</p>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold">Availability</p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--c-text-secondary)]">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Free cancellation</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Instant confirmation</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Budget</p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--c-text-secondary)]">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Free entry</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Under ₹500</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Premium experiences</label>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold">Traveler style</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Solo', 'Family', 'History', 'Local food'].map((item) => (
                      <span key={item} className="badge badge-neutral">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <section>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-[var(--c-text-secondary)]">{results.length} places found</p>
                  <h1 className="mt-1 text-[2rem]">Places to explore nearby</h1>
                </div>
                <label className="input-wrap max-w-[180px]">
                  <span className="input-label">Sort by</span>
                  <select className="input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                    <option value="relevance">Relevance</option>
                    <option value="rating">Top rated</option>
                    <option value="distance">Distance</option>
                    <option value="price-low">Price: low to high</option>
                  </select>
                </label>
              </div>

              {loading ? (
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`explore-skeleton-${index}`} className="space-y-3">
                      <div className="skeleton aspect-[20/19] rounded-[var(--r-lg)]" />
                      <div className="skeleton h-4 w-4/5" />
                      <div className="skeleton h-4 w-3/5" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2">
                  {results.map((place) => (
                    <PlaceCard
                      key={place.id}
                      meta={Number(place.price || 0) === 0 ? 'No hidden fees' : 'Total shown upfront'}
                      onSelect={(selected) => navigate(`/place/${selected.id}`)}
                      place={place}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="hide-mobile">{mapPanel}</div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setMobileMapOpen(true)}
        className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[var(--c-text-primary)] px-5 py-3 text-sm font-bold text-white shadow-[var(--shadow-card)] lg:hidden"
      >
        Show Map
      </button>

      {mobileMapOpen ? (
        <div className="bottom-sheet-overlay lg:hidden">
          <div className="bottom-sheet !p-0">
            <div className="bottom-sheet-handle mt-3" />
            <div className="px-4 pb-4">
              <div className="h-[56vh] overflow-hidden rounded-[var(--r-xl)] border border-[var(--c-border)]">
                <MapView
                  center={location || { lat: 20.5937, lng: 78.9629 }}
                  places={results}
                  userLocation={location}
                  onMarkerClick={(place) => navigate(`/place/${place.id}`)}
                  zoom={location ? 13 : 5}
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="font-semibold">{results.length} places</p>
                <button type="button" className="btn-outline btn-sm" onClick={() => setMobileMapOpen(false)}>
                  Close Map
                </button>
              </div>
            </div>
            <div className="max-h-[30vh] overflow-y-auto border-t border-[var(--c-border)] px-4 pb-6 pt-4">
              <div className="space-y-6">
                {results.slice(0, 4).map((place) => (
                  <PlaceCard
                    key={`mobile-${place.id}`}
                    meta="Open details"
                    onSelect={(selected) => navigate(`/place/${selected.id}`)}
                    place={place}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
