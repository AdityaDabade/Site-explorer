const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["weather", "route", "trekking", "event", "general"],
      default: "general"
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info"
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      default: null
    },
    active: {
      type: Boolean,
      default: true
    },
    starts_at: {
      type: Date,
      default: Date.now
    },
    ends_at: {
      type: Date,
      default: null
    }
  },
  buildSchemaOptions()
);

module.exports = mongoose.model("Alert", alertSchema);
