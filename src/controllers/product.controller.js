const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { Product } = require("../models");
const Joi = require("joi");


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
      category: Joi.string().required(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    console.log("bodyyyy  ---", req.files);
    const productExist = await Product.findOne({ name: req.body.name });

    if (productExist) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .send({ message: "Product already exist" });
    }
    const images = [];
    req.files?.map(async (file) => {
      images.push(file.location);
    });
    console.log("imagesss", images);

    req.body.images = images;

    
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
      dealerPrice: Joi.number(),
      manufacturername: Joi.string().optional().trim(),
      manufacturernumber: Joi.string().optional().trim(),
      manufactureraddress: Joi.string().optional().trim(),
      category: Joi.string(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const product = await Product.findById(req.params._id);
    if (!product) {
      return res
        .status(httpStatus.NOT_FOUND)
        .send({ message: "Product not found" });
    }
    console.log('bodyy',req.body);
    console.log('bodyy',product);

    const updateData = req.body;
    const images = [...product.images];
    req.files?.map(async (file) => {
      images.push(file.location);
    });
    updateData.images = images;

    // update product data
    Object.assign(product, updateData);
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

  const products = await Product.paginate(query, { page, limit }).populate(
    "category"
  );


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
    return res.status(httpStatus.NOT_FOUND).send({ message: 'product not found' });
  }

  await product.remove();
  return res.send({ message: 'product deleted successfully' });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAll
};
