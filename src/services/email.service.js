const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};


const sendEmailForStatus = async (to, status) => {
  const subject = 'Account Status';
  const text = `Dear user,
  Your account status is ${status}`;
  await sendEmail(to, subject, text);
};

const sendEmailForForgotPassword = async (to, resetToken) => {
  const subject = 'Reset Password';
  const text = `Dear user,
  Please click on the following link to reset your password: ${config.frontendUrl}/reset-password?token=${resetToken}`;
  await sendEmail(to, subject, text);
}

module.exports = {
  transport,
  sendEmail,
  sendEmailForStatus,
  sendEmailForForgotPassword,
};
