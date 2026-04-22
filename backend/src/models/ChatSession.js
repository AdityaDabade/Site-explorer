const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      default: null
    },
    zone: {
      type: String,
      default: "general"
    },
    messages: {
      type: [messageSchema],
      default: []
    },
    summary: {
      type: String,
      default: ""
    },
    vector_document_id: {
      type: String,
      default: ""
    },
    vector_synced: {
      type: Boolean,
      default: false
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  buildSchemaOptions()
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
