const httpStatus = require('http-status');
const { tokenService } = require('../services');
const Joi = require('joi');
const { password } = require('../validations/custom.validation');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { saveFile } = require('../utils/helper');
const bcrypt = require('bcryptjs');


const register = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required().custom(password),
      role: Joi.string().valid('user', 'admin', 'dealer').default('user'),
      // phone number is required and and 10 digit number
      phone: Joi.string().required().pattern(new RegExp('^[0-9]{10}$')),
    }),
  },
  handler: async (req, res) => {
    
    // check if email is already registered
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // if user status is approved, throw error
      if(user.status === 'approved') {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User already registered');
      }
    }

    // if role is dealer, check if documentUrl is provided
    if (req.body.role === "dealer" && !req.files[0]?.location) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Document Url is required for service provider');
    }

    if (req.body.role === "dealer") {
      req.body.status = 'pending';
    req.body.documentUrl = req.files[0]?.location;

    }

    // phone number is required and and 10 digit number and unique in db
    const phone = await User
      .findOne({ phone: req.body.phone });
    if (phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already registered');
    }
    

   
    req.body.password = await bcrypt.hash(req.body.password, 8);
    
    let newUser
    if(user && user.status === 'rejected' && user.role === 'dealer') {

      newUser = await User.findByIdAndUpdate(user._id, req.body, { new: true });     
    } else {

      newUser = await new User(req.body).save();  
    } 
    
    const token = await tokenService.generateAuthTokens(newUser);
    return res.status(httpStatus.CREATED).send({ token, user: newUser });
  }
};

const login = {
  validation: {
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  },
  handler: async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User with this email does not exist');
    }

    if (user.status === 'pending') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Your account is not verified yet');
    }

    if (user.status === 'rejected') {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Your account is rejected');
    }

    if (!(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
    }

    const token = await tokenService.generateAuthTokens(user);
    return res.status(httpStatus.OK).send({ token, user });
  }
};


module.exports = {
  register,
  login,
};
