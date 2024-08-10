const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const catchAsync = require('../../utils/catchAsync');
const { profileUploadS3 } = require('../../middlewares/s3-helper');

const router = express.Router();

const uploadImage = profileUploadS3.array("images", 5);
router.post('/register', uploadImage, validate(authController.register.validation), catchAsync(authController.register.handler));
router.post('/login', validate(authController.login.validation), catchAsync(authController.login.handler));


module.exports = router;
