const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Product } = require("../models");
const Joi = require("joi");
const { saveFile } = require("../utils/helper");

const createProduct = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      sellerPrice: Joi.number().required(),
      manufacturername: Joi.string().optional().trim(),
      manufacturernumber: Joi.string().optional().trim(),
      manufactureraddress: Joi.string().optional().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    console.log("---", req);
    const productExist = await Product.findOne({ name: req.body.name });

    if (productExist) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: "Product already exist" });
    }

    // save image
    if (req.files?.image) {
      const { upload_path } = await saveFile(req.files.image, "product");
      req.body.image = upload_path;
    }
    console.log("body-----", req.body);
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
      sellerPrice: Joi.number(),
      manufacturername: Joi.string().optional().trim(),
      manufacturernumber: Joi.string().optional().trim(),
      manufactureraddress: Joi.string().optional().trim(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const product = await Product.findById(req.params._id);
    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Product not found" });
    }

    if (req.body?.name) {
      const productExist = await Product.findOne({
        name: req.body.name,
        _id: { $ne: req.params._id },
      });
      if (productExist) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .send({ message: "Product already exist" });
      }
    }

    Object.assign(product, req.body);
    await product.save();

    return res.send(product);
  }),
};

const getProducts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const userRole = req.user.role;

  const query = {
    isActive: true,
    ...(search && { name: { $regex: search, $options: "i" } }),
  };

  const products = await Product.paginate(query, { page, limit });

  res.send({ ...products });
});

const getAll = catchAsync(async (req, res) => { const products = await Product.find(); res.status(httpStatus.OK).send(products); });


const getProductById = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params._id);
  const userRole = req.user.role;
  if (!product) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Product not found" });
  }
  let productObj = product.toObject();
  if (userRole === "seller") {
    productObj.price = product.sellerPrice;
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
      .send({ message: "Product not found" });
  }

  product.isActive = false;
  await product.save();

  return res.send({ message: "Product deleted successfully" });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAll
};
