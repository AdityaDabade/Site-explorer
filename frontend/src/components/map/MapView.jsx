import PropTypes from 'prop-types';
import L from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import PlaceMarker from './PlaceMarker';

const userIcon = L.divIcon({
  className: 'tourvision-user-marker',
  html: `
    <div style="
      position: relative;
      width: 22px;
      height: 22px;
      border-radius: 999px;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), #7dd3fc 45%, #2563eb 100%);
      border: 1px solid rgba(255,255,255,0.72);
      box-shadow: 0 14px 28px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.32);
    ">
      <span style="
        position: absolute;
        inset: -7px;
        border-radius: 999px;
        border: 1px solid rgba(125,211,252,0.28);
        background: rgba(125,211,252,0.08);
      "></span>
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

/**
 * Keeps the map view centered whenever coordinates change.
 */
function RecenterMap({ center, zoom }) {
  const map = useMap();

  map.setView([center.lat, center.lng], zoom, {
    animate: true
  });

  return null;
}

RecenterMap.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }).isRequired,
  zoom: PropTypes.number.isRequired
};

/**
 * Shared Leaflet map wrapper for place markers, routes, and user position.
 */
export default function MapView({
  center,
  onMarkerClick,
  places,
  routeCoordinates,
  userLocation,
  zoom
}) {
  return (
    <MapContainer
      center={[Number(center.lat), Number(center.lng)]}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} zoom={zoom} />

      {userLocation ? (
        <Marker icon={userIcon} position={[Number(userLocation.lat), Number(userLocation.lng)]} />
      ) : null}
      {places.map((place) => (
        <PlaceMarker key={place.id || `${place.lat}-${place.lng}`} place={place} onClick={onMarkerClick} />
      ))}
      {routeCoordinates?.length ? (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#7dd3fc',
            weight: 6,
            opacity: 0.85
          }}
        />
      ) : null}
    </MapContainer>
  );
}

MapView.propTypes = {
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }).isRequired,
  onMarkerClick: PropTypes.func,
  places: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  routeCoordinates: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.number)
  ),
  userLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  zoom: PropTypes.number
};

MapView.defaultProps = {
  onMarkerClick: undefined,
  places: [],
  routeCoordinates: [],
  userLocation: null,
  zoom: 13
};
