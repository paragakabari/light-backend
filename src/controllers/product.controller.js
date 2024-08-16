const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Product, Category } = require("../models");
const Joi = require("joi");
// const { model } = require("mongoose");
const mongoose = require('mongoose');
// const ObjectId = mongoose.Types.ObjectId;
const getProdsuctsByCategory = catchAsync(async (req, res) => {
  const { categoryId, page = 0, limit = 10, search } = req.query;

  let query = {
    
    ...(search && { name: { $regex: search, $options: "i" } }), // Allow search within the category
  };
  if (categoryId) {
    query.category = new mongoose.Types.ObjectId(categoryId);
  } 
console.log('queryy',query);


  // Perform pagination
  const paginatedResult = await Product.find(query).skip(page).limit(limit).populate({
    path: "category",
    model: "Category",
  })



  // Manually assign the populated documents back to the paginated result
  // paginatedResult.docs = productsWithCategory;

  res.send({ ...paginatedResult });
});

const createProduct = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      dealerPrice: Joi.number().required(),
      manufacturername: Joi.string().optional().trim(),
      manufacturernumber: Joi.string().optional().trim(),
      manufactureraddress: Joi.string().optional().trim(),
      category: Joi.string().required(), // Category is required
    }),
  },
  handler: catchAsync(async (req, res) => {
    const productExist = await Product.findOne({ name: req.body.name });

    if (productExist) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: "Product already exists" });
    }

    const images = [];
    req.files?.map((file) => {
      images.push(file.location);
    });

    req.body.images = images;
    console.log(req.body);
    // Ensure the category exists
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Category not found" });
    }

    const product = await Product.create(req.body);
    return res.status(httpStatus.CREATED).send(product);
  }),
};

const updateProduct = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().trim(),
      description: Joi.string(),
      price: Joi.number(),
      dealerPrice: Joi.number(),
      manufacturername: Joi.string().optional().trim(),
      manufacturernumber: Joi.string().optional().trim(),
      manufactureraddress: Joi.string().optional().trim(),
      category: Joi.string(), // Optional for updates
    }),
  },
  handler: catchAsync(async (req, res) => {
    const product = await Product.findById(req.params._id);
    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Product not found" });
    }

    const updateData = req.body;
    const images = [...product.images];
    req.files?.map((file) => {
      images.push(file.location);
    });
    updateData.images = images;

    // Ensure the category exists if it's being updated
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "Category not found" });
      }
    }

    Object.assign(product, updateData);
    await product.save();

    return res.send(product);
  }),
};

const getProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const query = {
    isActive: true,
    ...(search && { name: { $regex: search, $options: "i" } }),
  };

  // Perform pagination
  // const paginatedResult = await Product.paginate(query, { page, limit });

  // // Populate the categories in the paginated documents
  // const productsWithCategory = await Category.populate(paginatedResult.docs, {
  //   path: "Category",
  //   select: "name",
  // });

  // Manually assign the populated documents back to the paginated result
  // paginatedResult.docs = productsWithCategory;
  const paginatedResult = await Product.find(query).skip(page).limit(limit).populate({
    select: "name",
    path: "category",
    model: "Category",
  })

  res.send({ ...paginatedResult });
});

const getAll = catchAsync(async (req, res) => {
  const products = await Product.find();
  res.status(httpStatus.OK).send(products);
});

const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params._id);
  const userRole = req.user.role;
  if (!product) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Product not found" });
  }
  let productObj = product.toObject();
  if (userRole === "dealer") {
    productObj.price = product.dealerPrice;
  }
  if (userRole !== "admin") {
    delete productObj.manufacturer;
  }
  return res.send(productObj);
});

const deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params._id);
  if (!product) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "product not found" });
  }

  await product.remove();
  return res.send({ message: "product deleted successfully" });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAll,
  getProdsuctsByCategory, // New Function Export
};
