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
  
    // Step 1: If categoryId is empty, send a positive response but still remove existing categories
    if (!categoryId || categoryId.length === 0) {
      await Access.deleteMany({ userId: userId });
  
      return res.status(httpStatus.OK).json({
        message: "No categories selected, but all previous categories have been removed.",
      });
    }
  
    // Step 2: If categoryId is not empty, remove all existing categories first
    await Access.deleteMany({ userId: userId });
  
    // Step 3: Create new access records for the provided categoryIds
    const accessPromises = categoryId.map((categoryId) => {
      return Access.create({
        categoryId: categoryId,
        userId: userId,
      });
    });
  
    // Wait for all access records to be created
    await Promise.all(accessPromises);
  
    // Step 4: Respond with success message
    res.status(httpStatus.CREATED).json({
      message: "Access created successfully for the specified category IDs.",
    });
  }),
  
  
};

module.exports = {
  createAccess,
};
