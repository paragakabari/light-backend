// models/Branch.js
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const accessSchema = mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
accessSchema.plugin(toJSON);
accessSchema.plugin(paginate);

/**
 * @typedef Branch
 */
const Branch = mongoose.model("Access", accessSchema);

module.exports = Branch;
