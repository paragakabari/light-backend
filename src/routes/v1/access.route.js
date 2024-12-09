// routes/v1/category.js
const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { accessController } = require('../../controllers');

const router = express.Router();

router.post('/access', auth(),catchAsync(accessController.createAccess.handler));


module.exports = router;
