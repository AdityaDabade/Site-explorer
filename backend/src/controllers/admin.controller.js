const Place = require("../models/Place");
const User = require("../models/User");
const Feedback = require("../models/Feedback");
const asyncHandler = require("../utils/asyncHandler");
const { failure, success } = require("../utils/response");

const getPendingContent = asyncHandler(async (req, res) => {
  const places = await Place.find({
    "ai_content.status": { $in: ["pending", "draft"] }
  }).sort({ updatedAt: -1 });

  const items = places.map((place) => {
    const serialized = place.toJSON();

    return {
      id: serialized.id,
      place_id: serialized.place_id,
      place_name: serialized.name,
      title: serialized.ai_content?.summary || serialized.name,
      type: "AI Content",
      status: serialized.ai_content?.status || "pending",
      date: serialized.updated_at || serialized.created_at,
      source: serialized.ai_content?.source || "local-fallback"
    };
  });

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

  return success(res, {
    place: place.toJSON()
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return success(res, {
    users: users.map((user) => user.toJSON()),
    total: users.length
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { active } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return failure(res, 404, "User not found.");
  }

  if (typeof active === "boolean") {
    user.active = active;
  }

  await user.save();

  return success(res, {
    user: user.toJSON()
  });
});

const getAdminStats = asyncHandler(async (req, res) => {
  const [users, places, pendingContent, feedback] = await Promise.all([
    User.countDocuments(),
    Place.countDocuments(),
    Place.countDocuments({ "ai_content.status": { $in: ["pending", "draft"] } }),
    Feedback.countDocuments()
  ]);

  return success(res, {
    users,
    places,
    pending_content: pendingContent,
    feedback
  });
});

module.exports = {
  getAdminStats,
  getPendingContent,
  getUsers,
  reviewContent,
  updateUser
};
