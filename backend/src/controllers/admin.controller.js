const path = require("path");

const Alert = require("../models/Alert");
const ChatSession = require("../models/ChatSession");
const Expense = require("../models/Expense");
const Feedback = require("../models/Feedback");
const Place = require("../models/Place");
const SystemSetting = require("../models/SystemSetting");
const Trip = require("../models/Trip");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { failure, success } = require("../utils/response");

const AI_SECTION_TITLES = ["Overview", "History", "Architecture", "Hidden Facts", "Trek Information"];

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getTripName(trip) {
  return trip.destinations?.map((item) => item.name).filter(Boolean).join(" -> ") || "Trip";
}

function parseCoordinates(body) {
  const lat = Number(body.latitude ?? body.lat);
  const lng = Number(body.longitude ?? body.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      type: "Point",
      coordinates: [lng, lat]
    };
  }

  return undefined;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function normalizeAiSections(place) {
  if (place.ai_sections?.length) {
    return place.ai_sections
      .map((section, index) => ({
        id: section._id?.toString() || `${index}`,
        title: section.title || AI_SECTION_TITLES[index] || "Section",
        body: section.body || "",
        order: section.order ?? index
      }))
      .sort((first, second) => first.order - second.order);
  }

  return AI_SECTION_TITLES.map((title, index) => ({
    id: `${index}`,
    title,
    body:
      title === "Overview"
        ? place.ai_content?.summary || place.ai_content?.description || place.description || ""
        : "",
    order: index
  }));
}

function serializePlace(place) {
  const data = place.toJSON();
  const [lng, lat] = data.location?.coordinates || [];

  return {
    ...data,
    latitude: lat ?? "",
    longitude: lng ?? "",
    ai_sections: normalizeAiSections(place),
    qr_total_scans: data.qr_stats?.total_scans || 0,
    qr_last_scan_at: data.qr_stats?.last_scan_at || null,
    popularity_score: (data.qr_stats?.total_scans || 0) + Math.round((data.rating || 0) * 10)
  };
}

function mediaFromUsers(users) {
  return users.flatMap((user) =>
    (user.uploaded_media || []).map((media) => ({
      id: `${user._id}-${media._id || media.media_url}`,
      owner_id: user._id.toString(),
      owner_name: user.name || user.email,
      trip_id: media.trip_id || media.trip?.toString() || "",
      media_url: media.media_url,
      mime_type: media.mime_type,
      original_name: media.original_name,
      uploaded_at: media.uploaded_at
    }))
  );
}

const getOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalTrips,
    activeTrips,
    completedTrips,
    totalPlaces,
    qrScanTotals,
    totalExpenses,
    expenseTotal,
    aiGuideUsage,
    places,
    users,
    trips
  ] = await Promise.all([
    User.countDocuments(),
    Trip.countDocuments(),
    Trip.countDocuments({ status: { $in: ["draft", "planned"] } }),
    Trip.countDocuments({ status: "completed" }),
    Place.countDocuments(),
    Place.aggregate([{ $group: { _id: null, total: { $sum: "$qr_stats.total_scans" } } }]),
    Expense.countDocuments(),
    Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ChatSession.countDocuments(),
    Place.find().sort({ updatedAt: -1 }).limit(5),
    User.find().select("-password").sort({ createdAt: -1 }).limit(5),
    Trip.find().sort({ createdAt: -1 }).limit(5)
  ]);

  const qrScans = qrScanTotals[0]?.total || 0;
  const recentActivity = [
    ...users.map((user) => ({
      type: "user",
      label: "New user registered",
      description: user.name || user.email,
      date: user.createdAt
    })),
    ...trips.map((trip) => ({
      type: "trip",
      label: trip.status === "completed" ? "Trip completed" : "New trip created",
      description: getTripName(trip),
      date: trip.updatedAt || trip.createdAt
    })),
    ...places.map((place) => ({
      type: "place",
      label: "New place added",
      description: place.name,
      date: place.createdAt
    }))
  ]
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, 10);

  return success(res, {
    cards: {
      total_users: totalUsers,
      total_trips: totalTrips,
      active_trips: activeTrips,
      completed_trips: completedTrips,
      total_places: totalPlaces,
      qr_scans: qrScans,
      ai_guide_usage: aiGuideUsage,
      total_expenses_recorded: totalExpenses,
      expense_value: expenseTotal[0]?.total || 0
    },
    recent_activity: recentActivity
  });
});

const getAnalytics = asyncHandler(async (req, res) => {
  const [places, monthlyTrips, monthlyUsers, expenses, aiUsage] = await Promise.all([
    Place.find().sort({ "qr_stats.total_scans": -1, rating: -1 }).limit(10),
    Trip.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    User.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Expense.aggregate([{ $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    ChatSession.aggregate([{ $group: { _id: "$zone", count: { $sum: 1 } } }])
  ]);

  return success(res, {
    most_visited_places: places.map((place) => ({
      name: place.name,
      visits: place.review_count || place.qr_stats?.total_scans || 0,
      rating: place.rating || 0
    })),
    most_scanned_qr: places.map((place) => ({
      name: place.name,
      scans: place.qr_stats?.total_scans || 0
    })),
    monthly_trip_growth: monthlyTrips.map((item) => ({ month: item._id, trips: item.count })),
    user_registrations: monthlyUsers.map((item) => ({ month: item._id, users: item.count })),
    ai_guide_usage: aiUsage.map((item) => ({ zone: item._id || "general", usage: item.count })),
    expense_statistics: expenses.map((item) => ({ category: item._id || "other", total: item.total, count: item.count }))
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const search = req.query.search ? new RegExp(escapeRegex(req.query.search), "i") : null;
  const query = search ? { $or: [{ name: search }, { email: search }] } : {};
  const users = await User.find(query).select("-password").sort({ createdAt: -1 });
  const tripCounts = await Trip.aggregate([{ $group: { _id: "$user", count: { $sum: 1 }, last: { $max: "$updatedAt" } } }]);
  const countMap = new Map(tripCounts.map((item) => [item._id?.toString(), item]));

  return success(res, {
    users: users.map((user) => {
      const data = user.toJSON();
      const tripMeta = countMap.get(user._id.toString()) || {};

      return {
        ...data,
        trips_created: tripMeta.count || 0,
        last_activity: tripMeta.last || data.updated_at
      };
    }),
    total: users.length
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return failure(res, 404, "User not found.");
  }

  if (typeof req.body.active === "boolean") {
    user.active = req.body.active;
  }

  if (["user", "traveler", "admin"].includes(req.body.role)) {
    user.role = req.body.role;
  }

  await user.save();
  return success(res, { user: user.toJSON() });
});

const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  return success(res, { id: req.params.id });
});

const getUserTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.params.id }).sort({ createdAt: -1 });
  return success(res, { trips: trips.map((trip) => trip.toJSON()), total: trips.length });
});

const getPlaces = asyncHandler(async (req, res) => {
  const search = req.query.search ? new RegExp(escapeRegex(req.query.search), "i") : null;
  const query = search ? { $or: [{ name: search }, { city: search }, { category: search }] } : {};
  const places = await Place.find(query).sort({ updatedAt: -1 });
  return success(res, { places: places.map(serializePlace), total: places.length });
});

const createPlace = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    return failure(res, 400, "Place name is required.");
  }

  const placeId = req.body.place_id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const location = parseCoordinates(req.body);
  const place = await Place.create({
    place_id: placeId,
    qr_id: req.body.qr_id || placeId,
    name: req.body.name,
    slug: req.body.slug || placeId.replace(/_/g, "-"),
    description: req.body.description || "",
    category: req.body.category || "General",
    city: req.body.city || "",
    location_name: req.body.location_name || req.body.location || "",
    location,
    image: req.body.image || normalizeList(req.body.images)[0] || "",
    images: normalizeList(req.body.images),
    videos: normalizeList(req.body.videos),
    ar_model_url: req.body.ar_model_url || "",
    has_ar: Boolean(req.body.ar_model_url)
  });

  return success(res, { place: serializePlace(place) }, 201);
});

const updatePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  const fields = ["name", "description", "category", "city", "location_name", "image", "ar_model_url", "qr_id", "slug"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      place[field] = req.body[field];
    }
  });

  const location = parseCoordinates(req.body);
  if (location) {
    place.location = location;
  }

  if (req.body.images !== undefined) {
    place.images = normalizeList(req.body.images);
  }

  if (req.body.videos !== undefined) {
    place.videos = normalizeList(req.body.videos);
  }

  place.has_ar = Boolean(place.ar_model_url);
  await place.save();
  return success(res, { place: serializePlace(place) });
});

const deletePlace = asyncHandler(async (req, res) => {
  await Place.findByIdAndDelete(req.params.id);
  return success(res, { id: req.params.id });
});

const updateAiGuide = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  const sections = Array.isArray(req.body.sections) ? req.body.sections : [];
  place.ai_sections = sections.map((section, index) => ({
    title: section.title || `Section ${index + 1}`,
    body: section.body || "",
    order: Number(section.order ?? index)
  }));
  place.ai_content = {
    ...place.ai_content,
    summary: req.body.summary ?? place.ai_content?.summary ?? "",
    description: req.body.description ?? place.ai_content?.description ?? "",
    facts: normalizeList(req.body.facts),
    status: "approved",
    reviewed_by: req.user._id,
    approved_at: new Date(),
    updated_at: new Date(),
    source: "admin"
  };
  place.has_ai_content = true;
  place.ai_content_available = true;
  await place.save();

  return success(res, { place: serializePlace(place) });
});

const generateQr = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  place.qr_id = req.body.qr_id || place.qr_id || place.place_id;
  await place.save();

  return success(res, {
    qr_id: place.qr_id,
    qr_url: `${req.protocol}://${req.get("host")}/api/qr/scan`,
    payload: place.qr_id
  });
});

const getTrips = asyncHandler(async (req, res) => {
  const query = req.query.status ? { status: req.query.status } : {};
  const trips = await Trip.find(query).populate("user", "name email").sort({ createdAt: -1 });
  return success(res, {
    trips: trips.map((trip) => ({
      ...trip.toJSON(),
      name: getTripName(trip),
      user_name: trip.user?.name || trip.user?.email || "Guest",
      cost: trip.budget?.total || 0
    })),
    total: trips.length
  });
});

const deleteTrip = asyncHandler(async (req, res) => {
  await Trip.findByIdAndDelete(req.params.id);
  await Expense.deleteMany({ trip: req.params.id });
  return success(res, { id: req.params.id });
});

const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate("place", "name").populate("user", "name email").sort({ createdAt: -1 });
  return success(res, {
    feedback: feedback.map((item) => ({
      ...item.toJSON(),
      place_name: item.place?.name || "General",
      user_name: item.user?.name || item.user?.email || "Guest"
    })),
    total: feedback.length
  });
});

const deleteFeedback = asyncHandler(async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  return success(res, { id: req.params.id });
});

const getMedia = asyncHandler(async (req, res) => {
  const users = await User.find({ "uploaded_media.0": { $exists: true } }).select("name email uploaded_media");
  return success(res, { media: mediaFromUsers(users) });
});

const uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files?.media || req.files?.files || [];

  if (!files.length) {
    return failure(res, 400, "At least one media file is required.");
  }

  const media = files.map((file) => ({
    media_url: `${req.protocol}://${req.get("host")}/uploads/${path.basename(file.path)}`,
    original_name: file.originalname,
    mime_type: file.mimetype,
    uploaded_at: new Date()
  }));

  req.account.uploaded_media.push(...media);
  await req.account.save();

  return success(res, { media }, 201);
});

const deleteMedia = asyncHandler(async (req, res) => {
  await User.updateMany({}, { $pull: { uploaded_media: { media_url: req.body.media_url } } });
  await Trip.updateMany({}, { $pull: { stories: { file_url: req.body.media_url } } });
  return success(res, { media_url: req.body.media_url });
});

const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find().populate("place", "name").sort({ createdAt: -1 });
  return success(res, {
    alerts: alerts.map((alert) => ({ ...alert.toJSON(), place_name: alert.place?.name || "All places" }))
  });
});

const createAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.create({
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || "general",
    severity: req.body.severity || "info",
    place: req.body.place || null,
    active: req.body.active !== false,
    starts_at: req.body.starts_at || new Date(),
    ends_at: req.body.ends_at || null
  });

  return success(res, { alert: alert.toJSON() }, 201);
});

const updateAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!alert) {
    return failure(res, 404, "Alert not found.");
  }
  return success(res, { alert: alert.toJSON() });
});

const deleteAlert = asyncHandler(async (req, res) => {
  await Alert.findByIdAndDelete(req.params.id);
  return success(res, { id: req.params.id });
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSetting.find();
  const map = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  return success(res, {
    settings: {
      app: map.app || { name: "TourVision" },
      ai: map.ai || { provider: "Gemini", autoGenerate: true },
      qr: map.qr || { prefix: "tourvision", trackScans: true },
      notifications: map.notifications || { alertsEnabled: true },
      ...map
    }
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const entries = Object.entries(req.body.settings || req.body);
  await Promise.all(
    entries.map(([key, value]) =>
      SystemSetting.findOneAndUpdate(
        { key },
        { key, value, updated_by: req.user._id },
        { new: true, upsert: true }
      )
    )
  );

  return getSettings(req, res);
});

const getPendingContent = asyncHandler(async (req, res) => {
  const places = await Place.find({ "ai_content.status": { $in: ["pending", "draft"] } }).sort({ updatedAt: -1 });
  const items = places.map((place) => ({
    id: place._id.toString(),
    place_id: place.place_id,
    place_name: place.name,
    title: place.ai_content?.summary || place.name,
    type: "AI Content",
    status: place.ai_content?.status || "pending",
    date: place.updatedAt,
    source: place.ai_content?.source || "local-fallback"
  }));

  return success(res, { items, total: items.length });
});

const reviewContent = asyncHandler(async (req, res) => {
  const { status, note = "" } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return failure(res, 400, "status must be approved or rejected.");
  }

  const place = await Place.findById(req.params.id);
  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  place.ai_content.status = status;
  place.ai_content.review_note = note;
  place.ai_content.reviewed_by = req.user._id;
  place.ai_content.approved_at = status === "approved" ? new Date() : null;
  place.has_ai_content = true;
  place.ai_content_available = status === "approved";
  await place.save();

  return success(res, { place: serializePlace(place) });
});

module.exports = {
  createAlert,
  createPlace,
  deleteAlert,
  deleteFeedback,
  deleteMedia,
  deletePlace,
  deleteTrip,
  deleteUser,
  generateQr,
  getAlerts,
  getAnalytics,
  getFeedback,
  getMedia,
  getOverview,
  getPendingContent,
  getPlaces,
  getSettings,
  getTrips,
  getUserTrips,
  getUsers,
  reviewContent,
  updateAiGuide,
  updateAlert,
  updatePlace,
  updateSettings,
  updateUser,
  uploadMedia
};
