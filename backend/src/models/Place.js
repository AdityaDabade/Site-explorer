const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const aiContentSchema = new mongoose.Schema(
  {
    description: String,
    summary: String,
    facts: {
      type: [String],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    ar_model_url: {
      type: String,
      default: ""
    },
    tts_audio: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "pending"
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    review_note: {
      type: String,
      default: ""
    },
    approved_at: {
      type: Date,
      default: null
    },
    source: {
      type: String,
      default: "local-fallback"
    },
    updated_at: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const placeSchema = new mongoose.Schema(
  {
    place_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    qr_id: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    category: {
      type: String,
      default: "General"
    },
    city: {
      type: String,
      default: ""
    },
    location_name: {
      type: String,
      default: ""
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    },
    geofence_polygon: {
      type: {
        type: String,
        enum: ["Polygon"],
        default: "Polygon"
      },
      coordinates: {
        type: [[[Number]]],
        default: []
      }
    },
    best_for: {
      type: String,
      default: ""
    },
    hours: {
      type: String,
      default: ""
    },
    entry_fee: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.5
    },
    review_count: {
      type: Number,
      default: 0
    },
    image: {
      type: String,
      default: ""
    },
    images: {
      type: [String],
      default: []
    },
    has_ar: {
      type: Boolean,
      default: false
    },
    ar_model_url: {
      type: String,
      default: ""
    },
    has_ai_content: {
      type: Boolean,
      default: false
    },
    ai_content_available: {
      type: Boolean,
      default: false
    },
    ai_content: {
      type: aiContentSchema,
      default: () => ({})
    }
  },
  buildSchemaOptions()
);

placeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);
