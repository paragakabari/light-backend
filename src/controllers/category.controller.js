// controllers/categoryController.js
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Category, Access } = require("../models");
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
  let query = {};

  // Check if req.user exists
  if (req.user) {
    let userRole = req.user;

    // Fetch access data for the user based on the role
    const accessData = await Access.find({ userId: userRole.id })
      .select("categoryId")
      .then((access) => access.map((a) => a.categoryId));

    // If the user is a dealer, filter categories based on access permissions
    if (userRole.role === "dealer") {
      query._id = { $in: accessData };  // Only fetch categories the dealer has access to
    }
  }

  // Fetch categories based on the query (if no user, it fetches all)
  const categories = await Category.find(query);

  // Send the response with the fetched categories
  res.status(httpStatus.OK).send(categories);
});



const getCategoriesWithAccessStatus = catchAsync(async (req, res) => {
  let query = {};
  let categoriesWithAccessStatus = [];

  // Get userId from query or use req.user if available
  let { userId } = req.params;
  console.log(userId);
  if (req.user) {
    userId = req.user.id;
  }

  // Fetch access data for the user
  const accessData = await Access.find({ userId })
    .select("categoryId")
    .then((access) => access.map((a) => a.categoryId.toString()));  // Store access data as string IDs

  // Fetch all categories
  const categories = await Category.find(query);

  // Add `hasAccess: true` if the user has access, otherwise `hasAccess: false`
  categoriesWithAccessStatus = categories.map((category) => {
    const hasAccess = accessData.includes(category._id.toString());  // Check if category is in accessData
    return {
      ...category.toObject(),
      hasAccess,  // Set hasAccess to true or false
    };
  });

  // Send the response with the fetched categories and access status
  res.status(httpStatus.OK).send(categoriesWithAccessStatus);
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
  getCategoriesWithAccessStatus
};
