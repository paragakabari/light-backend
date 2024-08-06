const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { productController } = require('../../controllers');

const router = express.Router();

router.post('/create', auth(), validate(productController.createProduct.validation), catchAsync(productController.createProduct.handler));
router.get('/get', auth(), catchAsync(productController.getProducts));
router.get('/getAll', catchAsync(productController.getAll));
router.get('/get/:_id', auth(), catchAsync(productController.getProductById));
router.put('/update/:_id', auth(), validate(productController.updateProduct.validation), catchAsync(productController.updateProduct.handler));
router.delete('/delete/:_id', auth(), catchAsync(productController.deleteProduct));





module.exports = router;
