const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');
const Joi = require('joi');
const { sendEmailForStatus, sendEmailForForgotPassword } = require('../services/email.service');
const crypto = require('crypto');
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
  // validation: {
  //   body: Joi.object().keys({
  //     status: Joi.string().required().valid('approved', 'rejected')
  //   }),
  // },
  handler: catchAsync(async (req, res) => {
    const user = await User.findById(req.params._id);


    console.log(user,"111111111")

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  
    user.status = req.body.status;



    console.log(req.body.status,"111111111")

    // send email to user
    if (req.body.status === 'approved') {
      // send email to user
      sendEmailForStatus(user.email, 'approved')
    }else if(req.body.status === 'rejected'){
      // send email to user
      sendEmailForStatus(user.email, 'rejected')
    }


    return res.send(user.save());
  }),
};


const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;
  await sendEmailForForgotPassword(user.email, resetUrl);

  res.status(httpStatus.OK).send({ message: 'Password reset link sent to your email.' });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password reset token is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(httpStatus.OK).send({ message: 'Password reset successful' });
});



module.exports = {
  getUser,
  updateStatus,
  forgotPassword,
  resetPassword

};
