import PropTypes from 'prop-types';

/**
 * Sticky action card shown on desktop sidebar.
 * Displays pricing, booking options, and key actions.
 */
export default function PlaceActionCard({
  guideLoading,
  isInsideGeofence,
  onAddToWishlist,
  onStartTour,
  onViewGuide,
  price,
  saved,
  score,
  travelers,
  visitDate,
  onTravelersChange,
  onVisitDateChange
}) {
  return (
    <div className="sticky top-[110px] rounded-[var(--r-xl)] border border-[var(--c-border)] bg-white p-7 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="score-bubble">{score}</span>
          <p className="mt-2 text-sm font-semibold">Exceptional</p>
        </div>
        <button
          type="button"
          className="text-2xl text-[var(--c-primary)]"
          onClick={onAddToWishlist}
          aria-label="Add to wishlist"
        >
          {saved ? '\u2665' : '\u2661'}
        </button>
      </div>

      <div className="mt-6">
        <p className="text-sm text-[var(--c-text-secondary)]">Price</p>
        <p className="mt-1 text-2xl font-bold">
          {price === 0 ? 'Free Entry' : `Rs ${price}/person`}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="input-wrap">
          <span className="input-label">When are you visiting?</span>
          <input
            className="input"
            type="date"
            value={visitDate}
            onChange={(event) => onVisitDateChange(event.target.value)}
          />
        </label>

        <label className="input-wrap">
          <span className="input-label">Travelers</span>
          <select className="input" value={travelers} onChange={(event) => onTravelersChange(event.target.value)}>
            <option>1 traveler</option>
            <option>2 travelers</option>
            <option>Family</option>
            <option>Group</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        className="btn-primary btn-full btn-lg mt-6"
        onClick={() => onStartTour(isInsideGeofence ? 'inside' : 'outside')}
        disabled={guideLoading}
      >
        {guideLoading ? 'Starting...' : 'Start AI Tour'}
      </button>
      <button type="button" className="btn-outline btn-full mt-3" onClick={onAddToWishlist}>
        Add to Wishlist
      </button>

      <div className="my-5 flex items-center gap-3 text-sm text-[var(--c-text-secondary)]">
        <span className="h-px flex-1 bg-[var(--c-border)]" />
        or
        <span className="h-px flex-1 bg-[var(--c-border)]" />
      </div>

      <button type="button" className="btn-secondary btn-full" onClick={onViewGuide}>
        Audio Guide
      </button>

      <p className="mt-4 text-sm text-[var(--c-text-secondary)]">
        Instant confirmation · No booking required
      </p>
      <div className="mt-4 urgency-tag">42 people exploring this today</div>
    </div>
  );
}

PlaceActionCard.propTypes = {
  guideLoading: PropTypes.bool.isRequired,
  isInsideGeofence: PropTypes.bool.isRequired,
  onAddToWishlist: PropTypes.func.isRequired,
  onStartTour: PropTypes.func.isRequired,
  onViewGuide: PropTypes.func.isRequired,
  onTravelersChange: PropTypes.func.isRequired,
  onVisitDateChange: PropTypes.func.isRequired,
  price: PropTypes.number.isRequired,
  saved: PropTypes.bool.isRequired,
  score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  travelers: PropTypes.string.isRequired,
  visitDate: PropTypes.string.isRequired
};
