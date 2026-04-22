const turf = require("@turf/turf");

function normalizePoint(lat, lng) {
  return turf.point([Number(lng), Number(lat)]);
}

function isPointInsideGeofence(polygon, lat, lng) {
  if (!polygon?.coordinates?.length && !Array.isArray(polygon)) {
    return false;
  }

  const geometry = polygon.type ? polygon : { type: "Polygon", coordinates: polygon };
  const turfPolygon = turf.polygon(geometry.coordinates);
  const point = normalizePoint(lat, lng);

  return turf.booleanPointInPolygon(point, turfPolygon, { ignoreBoundary: false });
}

function distanceBetweenCoordinates(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  return turf.distance(
    turf.point([origin.lng, origin.lat]),
    turf.point([destination.lng, destination.lat]),
    { units: "kilometers" }
  );
}

function getZoneByFenceMatch(isInside) {
  return isInside ? "inside" : "outside";
}

module.exports = {
  distanceBetweenCoordinates,
  getZoneByFenceMatch,
  isPointInsideGeofence
};
