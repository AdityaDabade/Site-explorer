import PropTypes from 'prop-types';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

const placeIcon = L.divIcon({
  className: 'tourvision-place-marker',
  html: `
    <div style="
      position: relative;
      width: 24px;
      height: 24px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(245,166,35,0.95) 42%, rgba(191,107,13,0.95) 100%);
      border: 1px solid rgba(255,255,255,0.7);
      box-shadow: 0 14px 28px rgba(0,0,0,0.32), inset 0 1px 2px rgba(255,255,255,0.4);
      backdrop-filter: blur(10px);
    ">
      <span style="
        position: absolute;
        inset: -6px;
        border-radius: 999px;
        border: 1px solid rgba(245,166,35,0.24);
        background: rgba(245,166,35,0.08);
      "></span>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

/**
 * Dedicated place marker for reusable map pin rendering.
 */
export default function PlaceMarker({ onClick, place }) {
  return (
    <Marker
      icon={placeIcon}
      position={[Number(place.lat), Number(place.lng)]}
      eventHandlers={{
        click: () => onClick?.(place)
      }}
    >
      <Popup>
        <div className="space-y-1">
          <p className="font-semibold">{place.name}</p>
          <p>{place.category || place.type || 'Place of interest'}</p>
        </div>
      </Popup>
    </Marker>
  );
}

PlaceMarker.propTypes = {
  onClick: PropTypes.func,
  place: PropTypes.shape({
    category: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string
  }).isRequired
};

PlaceMarker.defaultProps = {
  onClick: undefined
};
