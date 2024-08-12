// controllers/categoryController.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Category } = require("../models");
const Joi = require("joi");

const createCategory = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      description: Joi.string().optional().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const categoryExist = await Category.findOne({ name: req.body.name });

    if (categoryExist) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: "Category already exists" });
    }

    const category = await Category.create(req.body);
    return res.status(httpStatus.CREATED).send(category);
  }),
};

const updateCategory = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().trim(),
      description: Joi.string().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const category = await Category.findById(req.params._id);
    if (!category) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Category not found" });
    }

    Object.assign(category, req.body);
    await category.save();

    return res.send(category);
  }),
};

const getCategoryById = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params._id);
  if (!category) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Category not found" });
  }
  return res.send(category);
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await Category.find();
  res.status(httpStatus.OK).send(categories);
});

const deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findById(req.params._id);
  if (!category) {
    return res.status(httpStatus.NOT_FOUND).send({ message: "Category not found" });
  }

  await category.remove();
  return res.send({ message: "Category deleted successfully" });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
