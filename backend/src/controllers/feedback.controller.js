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
  const { rating, comment = "", place_id: placeId } = req.body;

  if (!rating || !placeId) {
    return failure(res, 400, "rating and place_id are required.");
  }

  const placeQuery = mongoose.Types.ObjectId.isValid(placeId)
    ? { _id: placeId }
    : { place_id: placeId };
  const place = await Place.findOne(placeQuery);

  if (!place) {
    return failure(res, 404, "Place not found.");
  }

  const feedback = await Feedback.create({
    place: place._id,
    user: req.user?._id || null,
    rating: Number(rating),
    comment,
    sentiment: inferSentiment(Number(rating), comment)
  });

  return success(
    res,
    {
      feedback: feedback.toJSON()
    },
    201
  );
});

const getFeedback = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.placeId) {
    query.place = req.query.placeId;
  }

  const feedback = await Feedback.find(query)
    .populate("place", "name place_id")
    .sort({ createdAt: -1 });

  return success(res, {
    feedback: feedback.map((item) => item.toJSON()),
    total: feedback.length
  });
});

module.exports = {
  getFeedback,
  submitFeedback
};
