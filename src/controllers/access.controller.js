const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Access } = require("../models");
const Joi = require("joi");

// Updated API to handle multiple categoryId
const createAccess = {
  validation: {
    body: Joi.object().keys({
      categoryId: Joi.array().required(),
      userId: Joi.string().required().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const { categoryId, userId } = req.body;
console.log(categoryId,userId)
    // Check if any of the categoryId already exists for the user
    const existingAccesses = await Access.find({
      categoryId: { $in: categoryId },
      userId: userId,
    });

    const existingCategoryId = existingAccesses.map((access) => access.categoryId);

    // Filter out categoryId that don't already have access
    const newCategoryId = categoryId.filter(
      (categoryId) => !existingCategoryId.includes(categoryId)
    );

    if (newCategoryId.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Access already exists for all provided category IDs.",
      });
    }

    // Create new access records for the remaining categoryId
    const accessPromises = newCategoryId.map((categoryId) => {
      return Access.create({
        categoryId: categoryId,
        userId: userId,
      });
    });

    // Wait for all access records to be created
    await Promise.all(accessPromises);

    res.status(httpStatus.CREATED).json({
      message: "Access created successfully for the specified category IDs.",
    });
  }),
};

module.exports = {
  createAccess,
};
