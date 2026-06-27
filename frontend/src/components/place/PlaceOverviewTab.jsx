import PropTypes from 'prop-types';

/**
 * Overview tab component showing place details and information cards.
 */
export default function PlaceOverviewTab({ aiContent, place }) {
  return (
    <div className="place-tab-surface space-y-6">
      <div>
        <p className="place-section-kicker">Overview</p>
        <h3 className="mt-1 text-2xl font-black text-slate-950">About this place</h3>
        <p className="mt-3 max-w-3xl text-base font-medium leading-8 text-slate-600">
          {aiContent?.description || place?.description || 'Detailed place information is being prepared.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="overview-info-card">
          <p className="text-sm font-black text-slate-950">Best for</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {place?.best_for || 'History walks and immersive storytelling'}
          </p>
        </div>
        <div className="overview-info-card">
          <p className="text-sm font-black text-slate-950">Opening hours</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            {place?.hours || 'Check local timings before visiting'}
          </p>
        </div>
        <div className="overview-info-card">
          <p className="text-sm font-black text-slate-950">Entry type</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
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
