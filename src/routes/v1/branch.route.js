// routes/v1/category.js
const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const { branchController } = require('../../controllers');

const router = express.Router();

router.post('/create', auth(), validate(branchController.createBranch.validation), catchAsync(branchController.createBranch.handler));
router.get('/getAll', catchAsync(branchController.getBranch));
router.get('/get/:_id', auth(), catchAsync(branchController.getBranchById));
router.put('/update/:_id', auth(), validate(branchController.updateBranch.validation), catchAsync(branchController.updateBranch.handler));
router.delete('/delete/:_id', auth(), catchAsync(branchController.deleteBranch));

module.exports = router;
