const mongoose = require("mongoose");

const Place = require("../models/Place");
const asyncHandler = require("../utils/asyncHandler");
const { calculateNearbyScore } = require("../utils/scoring");
const { getZoneByFenceMatch, isPointInsideGeofence } = require("../services/geofence.service");
const { generatePlaceContent } = require("../services/aiContent.service");
const { failure, success } = require("../utils/response");

function parsePlaceIdentifier(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { _id: id };
  }

  return { place_id: id };
}

function normalizeQueryNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeRadiusInMeters(radiusValue, fallbackKm) {
  const radiusKm = Number(radiusValue || fallbackKm);
  return Number.isFinite(radiusKm) ? radiusKm * 1000 : fallbackKm * 1000;
}

async function fetchNearbyPlaces({ lat, lng, radiusInMeters, excludeId = null, limit = 20 }) {
  const query = lat !== null && lng !== null
    ? {
        location: {
          $nearSphere: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: radiusInMeters
          }
        }
      }
    : {};

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const places = await Place.find(query).limit(limit);

  return places
    .map((place) => {
      const base = place.toJSON();
      const { distanceKm, score } = calculateNearbyScore(base, lat !== null && lng !== null ? { lat, lng } : null);

      return {
        ...base,
        distance: distanceKm !== null ? Number(distanceKm.toFixed(2)) : null,
        score
      };
    })
    .sort((first, second) => second.score - first.score);
}

const getPlaces = asyncHandler(async (req, res) => {
  const lat = normalizeQueryNumber(req.query.lat);
  const lng = normalizeQueryNumber(req.query.lng);
  const radiusInMeters = normalizeRadiusInMeters(req.query.radius, 5);
  const limit = Number(req.query.limit || 20);

  const items = await fetchNearbyPlaces({
    lat,
    lng,
    radiusInMeters,
    limit
  });

  return success(res, {
    places: items,
    items,
    total: items.length
  });
});

const getNearbyPlaces = asyncHandler(async (req, res) => {
  const lat = normalizeQueryNumber(req.query.lat);
  const lng = normalizeQueryNumber(req.query.lng);
  const radiusInMeters = normalizeRadiusInMeters(req.query.radius, 5);
  const limit = Number(req.query.limit || 12);

  if (lat === null || lng === null) {
    return failure(res, 400, "lat and lng query parameters are required.");
  }

  const items = await fetchNearbyPlaces({
    lat,
    lng,
    radiusInMeters,
    limit
  });

  return success(res, {
    places: items,
    items,
    total: items.length
  });
});

const getPlaceById = asyncHandler(async (req, res) => {
  const place = await Place.findOne(parsePlaceIdentifier(req.params.id));

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  const basePlace = place.toJSON();
  const [lng, lat] = basePlace.location?.coordinates || [];
  const nearbyPlaces =
    lat !== undefined && lng !== undefined
      ? await fetchNearbyPlaces({
          lat,
          lng,
          radiusInMeters: 15000,
          excludeId: place._id,
          limit: 6
        })
      : [];

  return success(res, {
    place: {
      ...basePlace,
      nearby_places: nearbyPlaces
    }
  });
});

const getPlaceAiContent = asyncHandler(async (req, res) => {
  const place = await Place.findOne(parsePlaceIdentifier(req.params.id));

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  if (!place.ai_content?.description && !place.ai_content?.summary) {
    const generatedContent = await generatePlaceContent(place.toJSON());
    place.ai_content = {
      ...place.ai_content,
      ...generatedContent,
      status: place.ai_content?.status || "pending",
      updated_at: new Date()
    };
    place.has_ai_content = true;
    place.ai_content_available = true;
    await place.save();
  }

  return success(res, {
    content: {
      ...place.ai_content,
      ar_model_url: place.ai_content?.ar_model_url || place.ar_model_url || "",
      tts_audio_url: place.ai_content?.tts_audio || ""
    }
  });
});

const scanQr = asyncHandler(async (req, res) => {
  const qrId = req.body.qr_id || req.body.qr_data;

  if (!qrId) {
    return failure(res, 400, "qr_id or qr_data is required.");
  }

  const place = await Place.findOne({
    $or: [{ qr_id: qrId }, { place_id: qrId }]
  });

  if (!place) {
    return failure(res, 404, "No place found for this QR code.");
  }

  return success(res, {
    place_id: place.place_id,
    placeId: place.place_id,
    place: place.toJSON()
  });
});

const checkGeofence = asyncHandler(async (req, res) => {
  const place = await Place.findOne(parsePlaceIdentifier(req.params.id));

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  const lat = normalizeQueryNumber(req.body.lat ?? req.query.lat);
  const lng = normalizeQueryNumber(req.body.lng ?? req.query.lng);

  if (lat === null || lng === null) {
    return failure(res, 400, "lat and lng are required.");
  }

  const inside = isPointInsideGeofence(place.geofence_polygon, lat, lng);

  return success(res, {
    place_id: place.place_id,
    isInside: inside,
    inside,
    zone: getZoneByFenceMatch(inside)
  });
});

module.exports = {
  checkGeofence,
  getNearbyPlaces,
  getPlaceAiContent,
  getPlaceById,
  getPlaces,
  scanQr
};
