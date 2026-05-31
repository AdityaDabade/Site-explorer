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

const selectedPlaceIcon = L.divIcon({
  className: 'tourvision-place-marker selected',
  html: `
    <div class="tourvision-marker-pulse"></div>
    <div style="
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: linear-gradient(135deg, #14b8a6, #0f172a);
      border: 3px solid rgba(255,255,255,0.95);
      box-shadow: 0 18px 34px rgba(15,23,42,0.36), 0 0 0 8px rgba(20,184,166,0.16);
      backdrop-filter: blur(10px);
    ">
      <span style="
        position: absolute;
        inset: 9px;
        border-radius: 999px;
        background: white;
      "></span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

function createStatusIcon(status) {
  const config = {
    completed: {
      bg: 'linear-gradient(135deg, #14b8a6, #047857)',
      ring: 'rgba(20,184,166,0.2)',
      label: '✓'
    },
    current: {
      bg: 'linear-gradient(135deg, #f59e0b, #0f172a)',
      ring: 'rgba(245,158,11,0.24)',
      label: '•'
    },
    upcoming: {
      bg: 'linear-gradient(135deg, #cbd5e1, #64748b)',
      ring: 'rgba(100,116,139,0.16)',
      label: ''
    }
  }[status || 'upcoming'];

  return L.divIcon({
    className: `tourvision-place-marker ${status || 'upcoming'}`,
    html: `
      ${status === 'current' ? '<div class="tourvision-marker-pulse"></div>' : ''}
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: grid;
        place-items: center;
        color: white;
        font-size: 13px;
        font-weight: 900;
        background: ${config.bg};
        border: 2px solid rgba(255,255,255,0.95);
        box-shadow: 0 16px 30px rgba(15,23,42,0.28), 0 0 0 8px ${config.ring};
      ">${config.label}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

/**
 * Dedicated place marker for reusable map pin rendering.
 */
export default function PlaceMarker({ onClick, place, selected }) {
  const mapsUrl = place.googleMapsUrl || (place.lat && place.lng ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}` : null);
  const icon = selected ? selectedPlaceIcon : place.status ? createStatusIcon(place.status) : placeIcon;

  return (
    <Marker
      icon={icon}
      position={[Number(place.lat), Number(place.lng)]}
      eventHandlers={{
        click: () => onClick?.(place)
      }}
    >
      <Popup>
        <div className="w-56 space-y-3">
          {place.image ? (
            <img className="h-24 w-full rounded-xl object-cover" src={place.image} alt="" />
          ) : null}
          <p className="font-semibold">{place.name}</p>
          <p>{place.category || place.type || 'Place of interest'}</p>
          {place.distanceLabel ? <p>{place.distanceLabel}</p> : null}
          {place.statusLabel ? <p className="font-semibold">{place.statusLabel}</p> : null}
          <div className="flex gap-2">
            <button type="button" className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white" onClick={() => onClick?.(place)}>
              AI Guide
            </button>
            {mapsUrl ? (
              <a className="rounded-lg bg-teal-500 px-3 py-2 text-xs font-bold text-white" href={mapsUrl} target="_blank" rel="noreferrer">
                Start
              </a>
            ) : null}
          </div>
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
    distanceLabel: PropTypes.string,
    googleMapsUrl: PropTypes.string,
    image: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string,
    statusLabel: PropTypes.string,
    type: PropTypes.string
  }).isRequired,
  selected: PropTypes.bool
};

PlaceMarker.defaultProps = {
  onClick: undefined,
  selected: false
};
