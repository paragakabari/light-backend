const express = require('express');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

router.post('/register', validate(authController.register.validation), catchAsync(authController.register.handler));
router.post('/login', validate(authController.login.validation), catchAsync(authController.login.handler));


module.exports = router;
