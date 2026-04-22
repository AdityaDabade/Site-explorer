const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const destinationSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      default: null
    },
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    destinations: {
      type: [destinationSchema],
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    transport: {
      type: String,
      default: "car"
    },
    members: {
      type: Number,
      default: 1
    },
    date_preference: {
      type: String,
      default: ""
    },
    route: {
      stops: {
        type: [destinationSchema],
        default: []
      },
      coordinates: {
        type: [[Number]],
        default: []
      },
      totalDistanceKm: {
        type: Number,
        default: 0
      },
      totalDurationHours: {
        type: Number,
        default: 0
      }
    },
    budget: {
      transport: {
        type: Number,
        default: 0
      },
      experiences: {
        type: Number,
        default: 0
      },
      food: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    stories: {
      type: [
        {
          file_url: String,
          original_name: String,
          mime_type: String,
          uploaded_at: {
            type: Date,
            default: Date.now
          }
        }
      ],
      default: []
    },
    status: {
      type: String,
      enum: ["draft", "planned", "completed"],
      default: "planned"
    }
  },
  buildSchemaOptions()
);

module.exports = mongoose.model("Trip", tripSchema);
