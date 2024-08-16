// routes/v1/category.js
const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { categoryController } = require('../../controllers');

const router = express.Router();

router.post('/create', auth(), validate(categoryController.createCategory.validation), catchAsync(categoryController.createCategory.handler));
router.get('/getAll', catchAsync(categoryController.getCategories));
router.get('/get/:_id', auth(), catchAsync(categoryController.getCategoryById));
router.put('/update/:_id', auth(), validate(categoryController.updateCategory.validation), catchAsync(categoryController.updateCategory.handler));
router.delete('/delete/:_id', auth(), catchAsync(categoryController.deleteCategory));

module.exports = router;