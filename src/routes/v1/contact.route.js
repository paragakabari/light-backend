const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { contactController } = require('../../controllers');

const router = express.Router();

router.post('/create',auth(), validate(contactController.createContact.validation), catchAsync(contactController.createContact.handler));
router.get('/get', auth(), catchAsync(contactController.getContacts));
router.get('/get/:_id', auth(), catchAsync(contactController.getContactById));
router.delete('/delete/:_id', auth(), catchAsync(contactController.deleteContact));

module.exports = router;
