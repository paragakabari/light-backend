const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { productController } = require('../../controllers');
const {  profileUploadS3, deleteImage } = require('../../middlewares/s3-helper');

const router = express.Router();
const uploadImage = profileUploadS3.array("images", 15);
// auth(), validate(productController.createProduct.validation)
router.post('/create',auth(), uploadImage,validate(productController.createProduct.validation), catchAsync(productController.createProduct.handler));
router.get('/get', auth(), catchAsync(productController.getProducts));
router.get('/getAll', catchAsync(productController.getAll));
router.get('/get/:_id', auth(), catchAsync(productController.getProductById));
router.put('/update/:_id', uploadImage,auth(),validate(productController.updateProduct.validation), catchAsync(productController.updateProduct.handler));
router.delete('/delete/:_id',auth(), catchAsync(productController.deleteProduct));

router.get("/search",auth(),catchAsync(productController.getProdsuctsByCategory));



module.exports = router;
