const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  buildSchemaOptions()
);

module.exports = mongoose.model("SystemSetting", systemSettingSchema);
