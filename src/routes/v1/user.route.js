const express = require('express');
const validate = require('../../middlewares/validate');
const userController = require('../../controllers/user.controller');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

router.get('/get', auth(), catchAsync(userController.getUser));
router.put('/update-status/:_id', auth(), validate(userController.updateStatus.validation), catchAsync(userController.updateStatus.handler));



module.exports = router;
