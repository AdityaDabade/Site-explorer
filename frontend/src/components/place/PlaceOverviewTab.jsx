import PropTypes from 'prop-types';

/**
 * Overview tab component showing place details and information cards.
 */
export default function PlaceOverviewTab({ aiContent, place }) {
  return (
    <div className="space-y-6">
      <div>
        <h3>About this place</h3>
        <p className="mt-3 text-[var(--c-text-secondary)]">
          {aiContent?.description || place?.description || 'Detailed place information is being prepared.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card card-bordered p-5">
          <p className="text-sm font-semibold">Best for</p>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">
            {place?.best_for || 'History walks and immersive storytelling'}
          </p>
        </div>
        <div className="card card-bordered p-5">
          <p className="text-sm font-semibold">Opening hours</p>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">
            {place?.hours || 'Check local timings before visiting'}
          </p>
        </div>
        <div className="card card-bordered p-5">
          <p className="text-sm font-semibold">Entry type</p>
          <p className="mt-2 text-sm text-[var(--c-text-secondary)]">
            {Number(place?.price || place?.entry_fee || 0) === 0 ? 'Free entry' : `Rs ${place?.price || place?.entry_fee} / person`}
          </p>
        </div>
      </div>
    </div>
  );
}

PlaceOverviewTab.propTypes = {
  aiContent: PropTypes.shape({
    description: PropTypes.string
  }),
  place: PropTypes.shape({
    best_for: PropTypes.string,
    description: PropTypes.string,
    entry_fee: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hours: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  })
};

PlaceOverviewTab.defaultProps = {
  aiContent: null,
  place: null
};
