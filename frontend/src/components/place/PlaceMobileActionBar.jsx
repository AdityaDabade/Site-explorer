import PropTypes from 'prop-types';

/**
 * Mobile action bar shown at bottom of page.
 * Displays price, rating, and primary CTA button.
 */
export default function PlaceMobileActionBar({ guideLoading, isInsideGeofence, onStartTour, price, score }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--c-border)] bg-white px-4 py-4 shadow-[var(--shadow-card)] lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{price === 0 ? 'Free Entry' : `Rs ${price}/person`}</p>
          <p className="text-sm text-[var(--c-text-secondary)]">{score} · Exceptional</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onStartTour(isInsideGeofence ? 'inside' : 'outside')}
          disabled={guideLoading}
        >
          {guideLoading ? 'Starting...' : 'Start AI Tour'}
        </button>
      </div>
    </div>
  );
}

PlaceMobileActionBar.propTypes = {
  guideLoading: PropTypes.bool.isRequired,
  isInsideGeofence: PropTypes.bool.isRequired,
  onStartTour: PropTypes.func.isRequired,
  price: PropTypes.number.isRequired,
  score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};
