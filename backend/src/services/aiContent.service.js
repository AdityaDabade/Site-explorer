const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const HeritagePlace = require("../models/HeritagePlace");
const NearbyService = require("../models/NearbyService");
const Place = require("../models/Place");
const { haversineKm } = require("../utils/distance");

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function isDeprecatedGeminiModel(modelName) {
  const normalized = modelName.replace(/^models\//, "");
  return normalized.endsWith("-flash-latest") || /^gemini(?:-\d+(?:\.\d+)?)?-pro$/.test(normalized);
}

function getGeminiModelName() {
  const configuredModel = (process.env.GEMINI_MODEL || "").trim();

  if (!configuredModel || isDeprecatedGeminiModel(configuredModel)) {
    return DEFAULT_GEMINI_MODEL;
  }

  return configuredModel;
}

function hasGeminiApiKey() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  return Boolean(apiKey && apiKey !== "your_api_key_here" && apiKey !== "your_new_gemini_api_key_here");
}

function logGeminiStartupStatus() {
  console.log(`Gemini API Key: ${hasGeminiApiKey() ? "FOUND" : "MISSING"}`);
  console.log(`Using model: ${getGeminiModelName()}`);
}

function cleanAiDisplayText(text) {
  return String(text || "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/^#+\s?/gm, "")
    .replace(/^\s*[-•]\s?/gm, "")
    .trim();
}

function normalizeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeCoordinates(source = {}) {
  const coordinates = source?.location?.coordinates || source?.coordinates;
  const lat = normalizeNumber(source.latitude ?? source.lat ?? coordinates?.lat ?? coordinates?.[1]);
  const lng = normalizeNumber(source.longitude ?? source.lng ?? coordinates?.lng ?? coordinates?.[0]);

  if (lat === null || lng === null) {
    return null;
  }

  return { lat, lng };
}

function normalizeSelectedPlace(place = {}) {
  if (!place) {
    return null;
  }

  const coordinates = normalizeCoordinates(place);

  return {
    id: place.place_id || place.id || place._id || "",
    name: place.name || "",
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lng ?? null,
    district: place.district || place.city || place.location_name || "",
    state: place.state || "",
    category: place.category || place.best_for || "",
    timings: place.timings || place.hours || "",
    entry_fee: Number(place.entry_fee || place.price || 0),
    architecture: place.architecture || place.ai_content?.architecture || "",
    best_time_to_visit: place.best_time_to_visit || "",
    estimated_visit_duration: place.estimated_visit_duration || "",
    parking: place.parking || "",
    weather: place.weather || null,
    raw_mongodb_context: {
      description: place.description || place.description_en || "",
      marathi_description: place.description_mr || "",
      facts: place.facts || place.facts_en || place.interesting_facts || place.ai_content?.hidden_facts || [],
      ai_content: place.ai_content || null
    },
    historical_summary:
      place.ai_content?.overview ||
      place.ai_content?.summary ||
      place.historical_importance_en ||
      place.historical_importance ||
      place.historical_importance_mr ||
      place.history ||
      place.ai_content?.history ||
      place.description_en ||
      place.description_mr ||
      place.description ||
      ""
  };
}

function normalizeUserLocation(location = {}) {
  const coordinates = normalizeCoordinates(location);

  if (!coordinates) {
    return null;
  }

  return {
    latitude: coordinates.lat,
    longitude: coordinates.lng,
    city: location.city || "",
    state: location.state || "",
    accuracy: location.accuracy || null
  };
}

function extractBudgetContext(message = "") {
  const text = String(message || "");
  const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)|([\d,]+)\s*(?:₹|rs\.?|inr)/i);
  const durationMatch = text.match(/\b(one|two|three|four|five|1|2|3|4|5)\s*(?:day|days?)\b/i);
  const groupMatch = text.match(/\b(family|friends|solo trip|solo|couple|luxury|low budget|budget|trek|honeymoon|photography|kids)\b/i);
  const hasPlanningIntent = /\b(budget|₹|rs\.?|inr|days?|low budget|luxury|one day|two day|family|friends|solo trip|solo|trek|honeymoon|photography|kids)\b/i.test(text);

  return {
    hasPlanningIntent,
    amount: amountMatch ? Number(String(amountMatch[1] || amountMatch[2]).replace(/,/g, "")) : null,
    duration: durationMatch ? durationMatch[0] : "",
    travelStyle: groupMatch ? groupMatch[0] : ""
  };
}

function formatNearbyPlacesForPrompt(places = []) {
  if (!places.length) {
    return "No nearby places were found in the database for the current context.";
  }

  return places
    .map((place, index) => {
      const fee = Number(place.entry_fee || 0);
      return [
        `${index + 1}. ${place.name}`,
        `category: ${place.category || "heritage place"}`,
        `district: ${place.district || "unknown"}`,
        `state: ${place.state || "unknown"}`,
        `distance: ${Number(place.distance_km || 0).toFixed(1)} km`,
        `timings: ${place.timings || place.hours || "not listed"}`,
        `entry fee: ${fee === 0 ? "free/unknown" : `Rs ${fee}`}`,
        `visit duration: ${place.estimated_visit_duration || "not listed"}`,
        `source: ${place.data_source || "MongoDB"}`
      ].join("; ");
    })
    .join("\n");
}

function formatServicesForPrompt(services = []) {
  if (!services.length) {
    return "No MongoDB services were found near the current context.";
  }

  return services
    .map((service, index) => {
      return [
        `${index + 1}. ${service.name}`,
        `type: ${service.type || "service"}`,
        `category: ${service.category || "not listed"}`,
        `distance: ${Number(service.distance_km || 0).toFixed(1)} km`,
        `rating: ${service.rating ?? "not listed"}`,
        `hours: ${service.hours || "not listed"}`,
        `address: ${service.address || "not listed"}`,
        `tags: ${Array.isArray(service.tags) && service.tags.length ? service.tags.join(", ") : "not listed"}`
      ].join("; ");
    })
    .join("\n");
}

function getStablePlaceKey(place) {
  return String(place?.place_id || place?.slug || place?.id || place?._id || place?.name || "")
    .trim()
    .toLowerCase();
}

async function getNearbyPlacesContext(origin, { excludePlace = null, limit = 8, radiusKm = 75 } = {}) {
  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    return [];
  }

  const [heritagePlaces, places] = await Promise.all([
    HeritagePlace.find({})
      .select("place_id slug name latitude longitude district state category timings hours entry_fee estimated_visit_duration rating")
      .lean(),
    Place.find({})
      .select("place_id slug name latitude longitude city location_name category hours entry_fee price rating")
      .lean()
  ]);

  const seen = new Set();
  const excludedKey = getStablePlaceKey(excludePlace);

  return [
    ...heritagePlaces.map((place) => ({ ...place, data_source: "HeritagePlace" })),
    ...places.map((place) => ({ ...place, district: place.city || place.location_name || "", data_source: "Place" }))
  ]
    .map((place) => {
      const coordinates = normalizeCoordinates(place);

      if (!coordinates) {
        return null;
      }

      const distance = haversineKm(origin.lat, origin.lng, coordinates.lat, coordinates.lng);

      return {
        ...place,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        distance_km: distance
      };
    })
    .filter((place) => place && place.distance_km <= radiusKm)
    .filter((place) => {
      const key = getStablePlaceKey(place);

      if (key && excludedKey && key === excludedKey) {
        return false;
      }

      if (!key) {
        return true;
      }

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((first, second) => first.distance_km - second.distance_km)
    .slice(0, limit);
}

async function getNearbyServicesContext(origin, { limitPerType = 5, radiusKm = 15 } = {}) {
  const empty = {
    hotels: [],
    restaurants: [],
    transport: [],
    parking: []
  };

  if (!origin || !Number.isFinite(origin.lat) || !Number.isFinite(origin.lng)) {
    return empty;
  }

  const services = await NearbyService.find({ is_active: true })
    .select("name type category latitude longitude location address rating review_count hours price_level tags source")
    .lean();

  return services
    .map((service) => {
      const coordinates = normalizeCoordinates(service);

      if (!coordinates) {
        return null;
      }

      return {
        ...service,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        distance_km: haversineKm(origin.lat, origin.lng, coordinates.lat, coordinates.lng)
      };
    })
    .filter((service) => service && service.distance_km <= radiusKm)
    .sort((first, second) => first.distance_km - second.distance_km)
    .reduce((groups, service) => {
      const type = String(service.type || "").toLowerCase();
      const category = String(service.category || "").toLowerCase();
      const tags = Array.isArray(service.tags) ? service.tags.join(" ").toLowerCase() : "";
      const bucket =
        type === "hotel"
          ? "hotels"
          : type === "restaurant"
            ? "restaurants"
            : /parking/.test(`${type} ${category} ${tags}`)
              ? "parking"
              : /fuel|hospital|transport|bus|railway|station|taxi|parking/.test(`${type} ${category} ${tags}`)
                ? "transport"
                : null;

      if (bucket && groups[bucket].length < limitPerType) {
        groups[bucket].push(service);
      }

      return groups;
    }, empty);
}

function buildTourismPrompt({ currentPage, userLocation, selectedPlace, nearbyHeritagePlaces, nearbyServices, budgetContext, message }) {
  const isPlacePage = String(currentPage || "").toLowerCase() === "place";
  const locationLines = userLocation
    ? [
        `Latitude: ${userLocation.latitude}`,
        `Longitude: ${userLocation.longitude}`,
        `City: ${userLocation.city || "unknown"}`,
        `State: ${userLocation.state || "unknown"}`
      ].join("\n")
    : "No user GPS context was provided.";

  const selectedPlaceLines = selectedPlace
    ? [
        `Place name: ${selectedPlace.name || "selected place"}`,
        `Latitude: ${selectedPlace.latitude ?? "unknown"}`,
        `Longitude: ${selectedPlace.longitude ?? "unknown"}`,
        `District: ${selectedPlace.district || "unknown"}`,
        `State: ${selectedPlace.state || "unknown"}`,
        `Historical category: ${selectedPlace.category || "unknown"}`,
        `Timings: ${selectedPlace.timings || "not listed"}`,
        `Entry fee: ${selectedPlace.entry_fee ? `Rs ${selectedPlace.entry_fee}` : "free/unknown"}`,
        `Best time to visit: ${selectedPlace.best_time_to_visit || "not listed"}`,
        `Estimated visit duration: ${selectedPlace.estimated_visit_duration || "not listed"}`,
        `Parking: ${selectedPlace.parking || "not listed"}`,
        `Weather: ${
          selectedPlace.weather
            ? [
                selectedPlace.weather.condition || "live weather",
                Number.isFinite(Number(selectedPlace.weather.temperature)) ? `${Math.round(Number(selectedPlace.weather.temperature))} C` : "",
                Number.isFinite(Number(selectedPlace.weather.rainProbability)) ? `${Math.round(Number(selectedPlace.weather.rainProbability))}% rain` : "",
                Number.isFinite(Number(selectedPlace.weather.windSpeed)) ? `${Math.round(Number(selectedPlace.weather.windSpeed))} km/h wind` : ""
              ]
                .filter(Boolean)
                .join(", ")
            : "not listed"
        }`,
        `Historical summary: ${selectedPlace.historical_summary || "not listed"}`,
        `Architecture: ${selectedPlace.architecture || "not listed"}`,
        `MongoDB facts: ${
          Array.isArray(selectedPlace.raw_mongodb_context?.facts) && selectedPlace.raw_mongodb_context.facts.length
            ? selectedPlace.raw_mongodb_context.facts.join("; ")
            : "not listed"
        }`
      ].join("\n")
    : "No selected place context was provided.";

  const budgetLines = budgetContext?.hasPlanningIntent
    ? [
        `Budget planning intent: yes`,
        `Mentioned budget: ${budgetContext.amount ? `Rs ${budgetContext.amount}` : "not specified"}`,
        `Trip duration: ${budgetContext.duration || "not specified"}`,
        `Travel style/group: ${budgetContext.travelStyle || "not specified"}`
      ].join("\n")
    : "Budget planning intent: no";

  return `You are TourVision's professional tourism expert for heritage travel.

Never answer as a generic chatbot. Always answer as a TourVision guide using the app and MongoDB context first. Use Gemini knowledge only to enrich the response with practical tourism advice, and do not override MongoDB facts. Do not invent place names, fees, timings, or distances. If data is missing, say it is not listed and give practical next steps.

Current page: ${currentPage || "Home"}

User location context:
${isPlacePage ? "Ignored for this Place page request. Use only the selected place as the origin." : locationLines}

Selected place context:
${selectedPlaceLines}

Nearby attractions from MongoDB:
${formatNearbyPlacesForPrompt(nearbyHeritagePlaces)}

Nearby hotels from MongoDB:
${formatServicesForPrompt(nearbyServices?.hotels)}

Nearby restaurants from MongoDB:
${formatServicesForPrompt(nearbyServices?.restaurants)}

Nearby transport from MongoDB:
${formatServicesForPrompt(nearbyServices?.transport)}

Nearby parking from MongoDB:
${formatServicesForPrompt(nearbyServices?.parking)}

Budget/trip context:
${budgetLines}

User question:
${message}

Response rules:
- If Current page is Home, answer relative to the user's GPS location.
- If Current page is Place, answer only relative to the selected place and always mention that place when helpful. Ignore the user's GPS location.
- If the user asks about budget, rupees, days, family, friends, solo, trek, honeymoon, photography, or kids, create a personalized itinerary with Morning, Afternoon, Evening, Estimated cost, Entry fees, Transport, Food, Nearby attractions, and Travel tips.
- Use nearby attractions, hotels, restaurants, transport, parking, weather, opening timings, entry fees, travel distance, estimated local travel cost, food suggestions, and transport suggestions when relevant.
- Keep answers concise, practical, and location-aware.
- Do not use Markdown symbols, bullets, or headings with # characters.`;
}

function getGeminiApiKey() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();

  if (!hasGeminiApiKey()) {
    const error = new Error("Gemini API key is not configured.");
    error.statusCode = 503;
    error.publicMessage = "Gemini API key is not configured.";
    throw error;
  }

  return apiKey;
}

function getGeminiModel() {
  const genAI = new GoogleGenerativeAI(getGeminiApiKey());

  return genAI.getGenerativeModel({
    model: getGeminiModelName()
  });
}

function getGeminiErrorDetails(error) {
  return {
    status: error?.status || error?.statusCode || error?.response?.status || null,
    statusText: error?.statusText || error?.response?.statusText || null,
    message: error?.message || null,
    details: error?.errorDetails || error?.response?.data?.error || error?.details || null,
    stack: error?.stack || null
  };
}

function logGeminiError(label, error) {
  console.error(label, getGeminiErrorDetails(error));
}

function toGeminiPublicError(error) {
  const details = [
    error?.message,
    error?.statusText,
    ...(Array.isArray(error?.errorDetails) ? error.errorDetails.map((detail) => JSON.stringify(detail)) : [])
  ]
    .filter(Boolean)
    .join(" ");

  if (/CONSUMER_SUSPENDED|has been suspended/i.test(details)) {
    return {
      statusCode: 503,
      message: "Gemini API access is suspended for the configured key. Replace it with a new active key."
    };
  }

  if (/API key not valid|permission denied|forbidden|PERMISSION_DENIED/i.test(details)) {
    return {
      statusCode: 503,
      message: "Gemini API key is invalid or does not have access."
    };
  }

  return {
    statusCode: 502,
    message: "Gemini service is temporarily unavailable."
  };
}

function getMlClient() {
  return axios.create({
    baseURL: process.env.ML_SERVICE_URL,
    timeout: Number(process.env.ML_SERVICE_TIMEOUT_MS || 12000)
  });
}

async function postToMl(path, payload) {
  if (!process.env.ML_SERVICE_URL) {
    return null;
  }

  const response = await getMlClient().post(path, payload);
  return response.data?.data || response.data;
}

async function generateAiGuideReply({ currentPage = "Home", userLocation = null, selectedPlace = null, message }) {
  const isPlacePage = String(currentPage).toLowerCase() === "place";
  const normalizedUserLocation = isPlacePage ? null : normalizeUserLocation(userLocation);
  const normalizedSelectedPlace = normalizeSelectedPlace(selectedPlace);
  const contextOrigin =
    isPlacePage && normalizedSelectedPlace?.latitude !== null && normalizedSelectedPlace?.longitude !== null
      ? { lat: normalizedSelectedPlace.latitude, lng: normalizedSelectedPlace.longitude }
      : isPlacePage
        ? null
        : normalizedUserLocation
        ? { lat: normalizedUserLocation.latitude, lng: normalizedUserLocation.longitude }
        : null;
  const budgetContext = extractBudgetContext(message);
  const nearbyHeritagePlaces = await getNearbyPlacesContext(contextOrigin, {
    excludePlace: isPlacePage ? normalizedSelectedPlace : null
  });
  const nearbyServices = await getNearbyServicesContext(contextOrigin);

  const prompt = buildTourismPrompt({
    currentPage,
    userLocation: normalizedUserLocation,
    selectedPlace: normalizedSelectedPlace,
    nearbyHeritagePlaces,
    nearbyServices,
    budgetContext,
    message
  });

  const model = getGeminiModel();
  console.log("Using model:", getGeminiModelName());

  const result = await model.generateContent(prompt);
  const replyText = cleanAiDisplayText(result.response.text());

  if (!replyText) {
    throw new Error("Gemini did not return a response.");
  }

  return {
    reply: replyText,
    caption: replyText,
    text: replyText,
    source: "gemini",
    context: {
      currentPage,
      userLocation: normalizedUserLocation,
      selectedPlace: normalizedSelectedPlace,
      nearbyHeritageCount: nearbyHeritagePlaces.length,
      nearbyServices,
      budget: budgetContext
    }
  };
}

async function generateChatReply({ place, placeId, zone, message, history = [], currentPage, userLocation, selectedPlace }) {
  const contextPlace = place || selectedPlace || null;
  const placeName = contextPlace?.name || placeId || "the current place";
  console.log("PLACE:", placeName);
  console.log("MESSAGE:", message);

  try {
    return await generateAiGuideReply({
      currentPage: currentPage || (contextPlace ? "Place" : "Home"),
      userLocation,
      selectedPlace: contextPlace,
      message
    });
  } catch (err) {
    const publicError = toGeminiPublicError(err);
    const error = new Error(publicError.message);
    error.statusCode = publicError.statusCode;
    error.publicMessage = publicError.message;
    logGeminiError("Gemini chat failed:", err);
    throw error;
  }
}

async function generatePlaceContent(place) {
  if (process.env.ML_SERVICE_URL) {
    try {
      const response = await postToMl("/places/generate", {
        place
      });

      return {
        ...response,
        source: "ml-service"
      };
    } catch (error) {
      console.warn("ML service place generation failed, using Gemini:", error.message);
    }
  }

  const model = getGeminiModel();
  console.log("Using model:", getGeminiModelName());
  const prompt = `You are a smart travel guide.

Create concise travel content for this place.
Place name: ${place.name}
City or location: ${place.city || place.location_name || ""}
Existing description: ${place.description || ""}

Return only JSON with this shape:
{
  "description": "short engaging description",
  "summary": "one short guide summary",
  "facts": ["fact one", "fact two", "fact three"]
}`;

  let generated;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const jsonText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
    generated = JSON.parse(jsonText);
  } catch (err) {
    const publicError = toGeminiPublicError(err);
    const error = new Error(publicError.message);
    error.statusCode = publicError.statusCode;
    error.publicMessage = publicError.message;
    logGeminiError("Gemini place content failed:", err);
    throw error;
  }

  return {
    description: cleanAiDisplayText(generated.description),
    summary: cleanAiDisplayText(generated.summary),
    facts: Array.isArray(generated.facts) ? generated.facts.map(cleanAiDisplayText) : [],
    images: place.images || [],
    ar_model_url: place.ar_model_url || "",
    source: "gemini"
  };
}

async function estimateTripCost(payload) {
  if (!process.env.ML_SERVICE_URL) {
    return {
      total: 0,
      breakdown: {}
    };
  }

  try {
    const response = await postToMl("/cost/estimate", payload);

    return {
      total: Number(response?.total || response?.estimated_total || 0),
      breakdown: response?.breakdown || response || {}
    };
  } catch (error) {
    console.warn("ML trip cost call failed:", error.message);
    return {
      total: 0,
      breakdown: {}
    };
  }
}

async function recommendHotels(payload) {
  return postToMl("/recommend/hotels", payload);
}

async function recognizeLandmark(payload) {
  return postToMl("/recognize", payload);
}

async function syncChatSessionToVectorDb(session) {
  if (!process.env.VECTOR_DB_URL) {
    return {
      synced: false,
      reason: "VECTOR_DB_URL not configured"
    };
  }

  try {
    const response = await axios.post(
      `${process.env.VECTOR_DB_URL.replace(/\/$/, "")}/sessions/upsert`,
      {
        session_id: String(session._id),
        place_id: session.place ? String(session.place) : null,
        user_id: session.user ? String(session.user) : null,
        zone: session.zone,
        messages: session.messages
      },
      {
        timeout: 8000
      }
    );

    return {
      synced: true,
      vector_document_id: response.data?.id || response.data?.document_id || null
    };
  } catch (error) {
    console.warn("Vector DB sync failed:", error.message);
    return {
      synced: false,
      reason: error.message
    };
  }
}

module.exports = {
  getGeminiModelName,
  hasGeminiApiKey,
  getGeminiApiKey,
  getGeminiModel,
  logGeminiStartupStatus,
  logGeminiError,
  cleanAiDisplayText,
  toGeminiPublicError,
  generateAiGuideReply,
  generateChatReply,
  generatePlaceContent,
  estimateTripCost,
  recognizeLandmark,
  recommendHotels,
  syncChatSessionToVectorDb
};
