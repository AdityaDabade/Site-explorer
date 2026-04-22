import PropTypes from 'prop-types';
import Loader from '../common/Loader';
import MapView from '../map/MapView';

/**
 * Route map and alert summary for generated trip plans.
 */
export default function RouteDisplay({ alerts, loading, route }) {
  const normalizedCoordinates =
    route?.coordinates?.map((point) =>
      Array.isArray(point) ? point : [point.lat, point.lng]
    ) || [];

  const center =
    normalizedCoordinates.length > 0
      ? { lat: normalizedCoordinates[0][0], lng: normalizedCoordinates[0][1] }
      : { lat: 20.5937, lng: 78.9629 };

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-white">Route Overview</h2>
          <p className="mt-1 text-sm text-slate-400">Weather and road alerts are displayed alongside the route.</p>
        </div>
        {loading ? <Loader label="Routing..." /> : null}
      </div>

      <div className="h-[320px] overflow-hidden rounded-[12px]">
        <MapView center={center} routeCoordinates={normalizedCoordinates} zoom={normalizedCoordinates.length ? 11 : 5} />
      </div>

      <div className="mt-4 grid gap-3">
        {(alerts || []).length ? (
          alerts.map((alert, index) => (
            <div key={`${alert}-${index}`} className="rounded-[12px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {typeof alert === 'string' ? alert : alert.message || 'Alert available'}
            </div>
          ))
        ) : (
          <div className="rounded-[12px] border border-dashed border-white/15 bg-slate-900/60 p-4 text-sm text-slate-400">
            Generate a plan to see route details and travel alerts.
          </div>
        )}
      </div>
    </section>
  );
}

RouteDisplay.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        message: PropTypes.string
      })
    ])
  ),
  loading: PropTypes.bool,
  route: PropTypes.shape({
    coordinates: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.number),
        PropTypes.shape({
          lat: PropTypes.number,
          lng: PropTypes.number
        })
      ])
    )
  })
};

RouteDisplay.defaultProps = {
  alerts: [],
  loading: false,
  route: null
};
