const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: "",
      trim: true
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral"
    }
  },
  buildSchemaOptions()
);

module.exports = mongoose.model("Feedback", feedbackSchema);
