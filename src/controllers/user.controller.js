const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { User } = require('../models');
const Joi = require('joi');
const { sendEmailForStatus, sendEmailForForgotPassword } = require('../services/email.service');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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



    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
  
    user.status = req.body.status;




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

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save token and expiry in the database
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = 1 * 60 * 1000 + Date.now(); // Token expires in 10 minutes
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `http://localhost:3000/reset-password/${user.resetPasswordToken}`;

  // Send email
  try {
    await sendEmailForForgotPassword(user.email, resetUrl);
    res.status(httpStatus.OK).send({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    // Rollback if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email could not be sent');
  }
});


const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password reset token is invalid or has expired');
  }

  // Hash the password before saving it
  user.password = await bcrypt.hash(password, 8); // You might want to adjust the hash rounds as needed
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(httpStatus.OK).send({ message: 'Password reset successful' });
});




const verifyResetToken = catchAsync(async (req, res) => {
  const { token } = req.params;  // Extract token from URL parameter

  // Find the user with the matching token and check if it is still valid (not expired)
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Token should be greater than current time (i.e. not expired)
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired token.');
  }

  // If the token is valid
  res.status(httpStatus.OK).send({ message: 'Token is valid.' });
});



module.exports = {
  getUser,
  updateStatus,
  forgotPassword,
  resetPassword,
  verifyResetToken

};
