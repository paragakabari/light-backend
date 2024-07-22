const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
