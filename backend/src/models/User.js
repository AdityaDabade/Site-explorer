const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { buildSchemaOptions } = require("../utils/mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["traveler", "admin"],
      default: "traveler"
    },
    active: {
      type: Boolean,
      default: true
    },
    avatar: {
      type: String,
      default: ""
    },
    preferences: {
      language: {
        type: String,
        default: "en"
      },
      interests: {
        type: [String],
        default: []
      }
    }
  },
  buildSchemaOptions()
);

userSchema.pre("save", async function handlePasswordHash(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
