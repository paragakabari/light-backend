// controllers/categoryController.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Branch } = require("../models");
const Joi = require("joi");

const createBranch = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      email: Joi.string().required().trim(),
      phone: Joi.string().required().trim(),
      address: Joi.string().required().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const branchExist = await Branch.findOne({ name: req.body.name });

    if (branchExist) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: "Branch already exists" });
    }

    const branch = await Branch.create(req.body);
    return res.status(httpStatus.CREATED).send(branch);
  }),
};

const updateBranch = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().trim(),
      email: Joi.string().trim(),
      phone: Joi.string().trim(),
      address: Joi.string().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const branch = await Branch.findById(req.params._id);
    if (!branch) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Branch not found" });
    }

    Object.assign(branch, req.body);
    await branch.save();

    return res.send(branch);
  }),
};

const getBranchById = catchAsync(async (req, res) => {
  const branch = await Branch.findById(req.params._id);
  if (!branch) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Branch not found" });
  }
  return res.send(branch);
});

const getBranch = catchAsync(async (req, res) => {
  const branch = await Branch.find();
  res.status(httpStatus.OK).send(branch);
});

const deleteBranch = catchAsync(async (req, res) => {
  const branch = await Branch.findById(req.params._id);
  if (!branch) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Branch not found" });
  }

  await branch.remove();
  return res.send({ message: "Branch deleted successfully" });
});

module.exports = {
  createBranch,
  getBranch,
  getBranchById,
  updateBranch,
  deleteBranch,
};
