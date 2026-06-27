import PropTypes from 'prop-types';

function NearbyPlaceCard({ onOpen, onToggleSave, place, saved }) {
  return (
    <article
      className="min-w-[260px] max-w-[260px] cursor-pointer rounded-[28px] bg-white p-3 shadow-[0_16px_36px_rgba(21,32,43,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(21,32,43,0.12)]"
      onClick={() => onOpen(place)}
    >
      <div className="relative aspect-[20/19] overflow-hidden rounded-[24px] bg-[var(--c-surface-inset)]">
        <img
          alt={place.name}
          className="h-full w-full object-cover transition duration-500 ease-out hover:scale-[1.03]"
          src={place.image}
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSave(place.id);
          }}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl text-[#18212f] shadow-[0_8px_18px_rgba(21,32,43,0.16)]"
          aria-label="Save place"
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>

      <div className="px-1 pb-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-[1rem] font-semibold leading-6">
            {place.name}
          </h3>
          <span className="score-bubble">{place.score}</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3 text-[13px] text-[var(--c-text-secondary)]">
          <span className="line-clamp-1">{place.location_name}</span>
          <span className="badge badge-neutral">
            {place.distance ? `${place.distance.toFixed(1)} km` : 'Nearby'}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="badge badge-neutral">{place.category}</span>
        </div>

        <div className="mt-2 text-[13px] text-[var(--c-text-secondary)]">
          ★ {place.rating.toFixed(1)} · {Number(place.review_count).toLocaleString()} reviews
        </div>

        <div className="mt-2 font-semibold text-[var(--c-text-primary)]">
          {place.free_entry ? 'From Rs 0 · Free Entry' : `Rs ${place.price} / person`}
        </div>
      </div>
    </article>
  );
}

NearbyPlaceCard.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onToggleSave: PropTypes.func.isRequired,
  place: PropTypes.shape({
    category: PropTypes.string,
    distance: PropTypes.number,
    free_entry: PropTypes.bool,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    image: PropTypes.string.isRequired,
    location_name: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    rating: PropTypes.number.isRequired,
    review_count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
  saved: PropTypes.bool.isRequired,
};

export default function NearbyPlaces({
  loading,
  onOpenPlace,
  onToggleSave,
  places,
  savedIds,
}) {
  if (loading) {
    return (
      <div className="scroll-row mt-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`sk-${index}`} className="min-w-[260px] max-w-[260px] space-y-3">
            <div className="skeleton aspect-[20/19] rounded-[24px]" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="scroll-row mt-6 pb-4">
      {places.slice(0, 8).map((place) => (
        <NearbyPlaceCard
          key={place.id}
          place={place}
          saved={savedIds.includes(place.id)}
          onOpen={onOpenPlace}
          onToggleSave={onToggleSave}
        />
      ))}
    </div>
  );
}

NearbyPlaces.propTypes = {
  loading: PropTypes.bool,
  onOpenPlace: PropTypes.func.isRequired,
  onToggleSave: PropTypes.func.isRequired,
  places: PropTypes.arrayOf(NearbyPlaceCard.propTypes.place).isRequired,
  savedIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
};

NearbyPlaces.defaultProps = {
  loading: false,
};
