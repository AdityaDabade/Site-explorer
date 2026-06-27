/**
 * NearbyPlaces
 * Renders a responsive grid of place cards with loading skeletons.
 *
 * Props:
 *   places       {array}    Normalized place objects
 *   loading      {boolean}  Shows skeleton cards while true
 *   savedIds     {number[]} IDs of saved/bookmarked places
 *   onOpenPlace  {function} Called with the place object when card is clicked
 *   onToggleSave {function} Called with place id when bookmark is toggled
 */

// ── Skeleton card shown while loading ────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[var(--r-xl)] bg-[var(--c-bg)] animate-pulse">
      <div className="h-48 w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="flex justify-between">
          <div className="h-3 w-1/4 rounded bg-gray-200" />
          <div className="h-3 w-1/4 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ── Single place card ─────────────────────────────────────────────────────────
function PlaceCard({ place, isSaved, onOpen, onToggleSave }) {
  const handleSave = (e) => {
    e.stopPropagation(); // don't trigger card click
    onToggleSave(place.id);
  };

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-[var(--r-xl)] bg-white shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-hover)]"
      onClick={() => onOpen(place)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {place.free_entry && (
            <span className="rounded-full bg-[var(--c-success)] px-2.5 py-1 text-[11px] font-bold text-white">
              Free
            </span>
          )}
        </div>

        {/* Score bubble — top right */}
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white font-heading text-sm font-extrabold text-[var(--c-text-primary)] shadow">
          {place.score}
        </div>

        {/* Save / bookmark button — bottom right */}
        <button
          type="button"
          aria-label={isSaved ? 'Remove from saved' : 'Save place'}
          onClick={handleSave}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition hover:bg-white"
        >
          {isSaved ? (
            // Filled heart
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            // Outline heart
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Category + distance */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--c-text-secondary)]">
            {place.category}
          </span>
          <span className="text-xs text-[var(--c-text-secondary)]">
            📍 {place.distance} km
          </span>
        </div>

        {/* Name */}
        <h3 className="mt-1.5 text-base font-bold text-[var(--c-text-primary)] leading-snug">
          {place.name}
        </h3>

        {/* Location */}
        <p className="mt-0.5 text-sm text-[var(--c-text-secondary)]">
          {place.location_name}
        </p>

        {/* Footer: rating + price */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-semibold text-[var(--c-text-primary)]">
              {place.rating}
            </span>
            <span className="text-xs text-[var(--c-text-secondary)]">
              ({place.review_count.toLocaleString()})
            </span>
          </div>

          <span className="text-sm font-semibold text-[var(--c-text-primary)]">
            {place.free_entry ? (
              <span className="text-[var(--c-success)]">Free entry</span>
            ) : (
              <>₹{place.price}</>
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function NearbyPlaces({ places = [], loading = false, savedIds = [], onOpenPlace, onToggleSave }) {
  // Show 8 skeletons while loading
  if (loading) {
    return (
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!places.length) {
    return (
      <div className="mt-10 flex flex-col items-center gap-3 text-center text-[var(--c-text-secondary)]">
        <span className="text-4xl">🗺️</span>
        <p className="font-semibold">No places found for this filter.</p>
        <p className="text-sm">Try selecting a different region.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          isSaved={savedIds.includes(place.id)}
          onOpen={onOpenPlace}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}
