const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');
const Joi = require('joi');
const { sendEmailForStatus } = require('../services/email.service');

const getUser = catchAsync(async (req, res) => {
  const user = await User.find({
    role: {
      $ne: 'admin'
    }
  });
  if (!user.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return res.send(user);
});

const updateStatus = {
  validation: {
    body: Joi.object().keys({
      status: Joi.string().required().valid('approved', 'rejected')
    }),
  },
  handler: catchAsync(async (req, res) => {
    const user = await User.findById(req.params._id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    Object.assign(user, req.body);
    await user.save();

    // send email to user
    if (req.body.status === 'approved') {
      // send email to user
      sendEmailForStatus(user.email, 'approved')
    }

    return res.send(user);
  }),
};


module.exports = {
  getUser,
  updateStatus
};
