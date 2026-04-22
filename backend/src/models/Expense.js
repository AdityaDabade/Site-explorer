const mongoose = require("mongoose");

const { buildSchemaOptions } = require("../utils/mongoose");

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "transport"
    },
    payer: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    participants: {
      type: [String],
      default: []
    },
    split: {
      per_person: {
        type: Number,
        default: 0
      },
      breakdown: {
        type: [
          {
            person: String,
            amount: Number
          }
        ],
        default: []
      }
    },
    incurred_on: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ""
    }
  },
  buildSchemaOptions()
);

module.exports = mongoose.model("Expense", expenseSchema);
