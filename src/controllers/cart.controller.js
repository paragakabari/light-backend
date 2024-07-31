const httpStatus = require('http-status');
const { Cart, Product } = require('../models');
const catchAsync = require('../utils/catchAsync');

const addItemToCart = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Product not found' });
  }

  let cart = await Cart.findOne( { userId});
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, price: product.price });
  }

  await cart.save();
  return res.status(httpStatus.OK).send(cart);
});

const getCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Cart not found' });
  }
  return res.send(cart);
});

const updateCartItem = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId});
  if (!cart) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Cart not found' });
  }

  const cartItem = cart.items.find(item => item.productId.toString() === productId);
  if (cartItem) {
    cartItem.quantity = quantity;
    if (cartItem.quantity <= 0) {
      cart.items.pull(cartItem);
    }
    await cart.save();
    return res.send(cart);
  }

  return res.status(httpStatus.NOT_FOUND).send({ message: 'Item not found in cart' });
});

const deleteCartItem = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Cart not found' });
  }

  const cartItem = cart.items.find((item) => item.productId.toString() === productId);
  if (cartItem) {
    cart.items.pull(cartItem);
    await cart.save();
    return res.send(cart);
  }

  return res.status(httpStatus.NOT_FOUND).send({ message: 'Item not found in cart' });
});

module.exports = {
  addItemToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
};
