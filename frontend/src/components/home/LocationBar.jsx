import PropTypes from 'prop-types';

export default function LocationBar({
  error,
  isLocating,
  location,
  onEnableLocation,
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[22px] bg-white/90 px-4 py-3 text-sm text-[#53616d] shadow-[0_12px_28px_rgba(21,32,43,0.10)] backdrop-blur">
      <span className="font-semibold text-[#18212f]">📍 Current location</span>
      {location ? (
        <span>
          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </span>
      ) : (
        <button
          type="button"
          className="font-semibold text-[var(--c-primary)]"
          onClick={onEnableLocation}
          disabled={isLocating}
        >
          {isLocating ? 'Enabling location...' : 'Enable Location'}
        </button>
      )}
      {error ? <span className="text-[var(--c-error)]">{error}</span> : null}
    </div>
  );
}

LocationBar.propTypes = {
  error: PropTypes.string,
  isLocating: PropTypes.bool,
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  onEnableLocation: PropTypes.func.isRequired,
};

LocationBar.defaultProps = {
  error: '',
  isLocating: false,
  location: null,
};
