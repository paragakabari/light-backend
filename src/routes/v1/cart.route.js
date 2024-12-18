const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { cartController } = require('../../controllers');

const router = express.Router();

router.post('/add-contact', auth(), catchAsync(cartController.addItemToCart));
router.get('/', auth(), catchAsync(cartController.getCart));
router.get('/getAll', auth(), catchAsync(cartController.getAllCart));
router.put('/update', auth(), catchAsync(cartController.updateCartItem));
router.delete('/delete/:productId', auth(), catchAsync(cartController.deleteCartItem));

module.exports = router;
