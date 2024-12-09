const express = require('express');
const validate = require('../../middlewares/validate');
const userController = require('../../controllers/user.controller');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

router.get('/get', auth(), catchAsync(userController.getUser));
router.put('/update-status/:_id', auth(), catchAsync(userController.updateStatus.handler));
router.post('/forgot-password', catchAsync(userController.forgotPassword));
router.post('/reset-password/:token', catchAsync(userController.resetPassword));



module.exports = router;
