const mongoose = require("mongoose");

const Feedback = require("../models/Feedback");
const Place = require("../models/Place");
const asyncHandler = require("../utils/asyncHandler");
const { failure, success } = require("../utils/response");

function inferSentiment(rating, comment = "") {
  const text = comment.toLowerCase();

  if (rating >= 4 || /(great|amazing|excellent|love|best|good)/.test(text)) {
    return "positive";
  }

  if (rating <= 2 || /(bad|poor|terrible|worst|hate)/.test(text)) {
    return "negative";
  }

  return "neutral";
}

const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment = "", name = "", place_id: placeId } = req.body;
  const numericRating = Number(rating);
  const trimmedComment = String(comment || "").trim();
  const trimmedName = String(name || "").trim();

  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    return failure(res, 400, "Rating must be between 1 and 5.");
  }

  if (!trimmedComment) {
    return failure(res, 400, "Feedback text is required.");
  }

  let place = null;

  if (placeId) {
    const placeQuery = mongoose.Types.ObjectId.isValid(placeId)
      ? { _id: placeId }
      : { place_id: placeId };
    place = await Place.findOne(placeQuery);

    if (!place) {
      return failure(res, 404, "Place not found.");
    }
  }

  const feedback = await Feedback.create({
    place: place?._id || null,
    user: req.user?._id || null,
    name: trimmedName || req.user?.name || "",
    rating: numericRating,
    comment: trimmedComment,
    sentiment: inferSentiment(numericRating, trimmedComment)
  });

  await feedback.populate([
    { path: "place", select: "name place_id" },
    { path: "user", select: "name email" }
  ]);

  return success(
    res,
    {
      feedback: serializeFeedback(feedback)
    },
    201
  );
});

function serializeFeedback(item) {
  const data = item.toJSON();
  return {
    ...data,
    place_name: item.place?.name || "General",
    user_name: item.user?.name || item.user?.email || data.name || "Guest"
  };
}

const getFeedback = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.placeId) {
    if (mongoose.Types.ObjectId.isValid(req.query.placeId)) {
      query.place = req.query.placeId;
    } else {
      const place = await Place.findOne({ place_id: req.query.placeId }).select("_id");
      if (!place) {
        return success(res, {
          feedback: [],
          total: 0
        });
      }
      query.place = place._id;
    }
  }

  const feedback = await Feedback.find(query)
    .populate("place", "name place_id")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return success(res, {
    feedback: feedback.map(serializeFeedback),
    total: feedback.length
  });
});

module.exports = {
  getFeedback,
  submitFeedback
};
