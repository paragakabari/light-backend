const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    dealerPrice: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: false,
      }
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minimumOrderQuantity: {
      type: Number,
      required: false,
    },

    manufacturername: {
      type: String,
      required: false,
    },
    manufacturernumber: {
      type: String,
      required: false,
    },
    manufactureraddress: {
      type: String,
      required: false,
    },
    purchasePrice: {
      type: String,
      required: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * @typedef Product
 */
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
