const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Contact } = require('../models');
const Joi = require('joi');

const createContact = {
  validation: {
    body: Joi.object().keys({
      name: Joi.string().required().trim(),
      email: Joi.string().required().email().trim(),
      subject: Joi.string().required().trim(),
      message: Joi.string().required(),
    }),
  },
  handler: catchAsync(async (req, res) => {
    const contact = await Contact.create(req.body);
    return res.status(httpStatus.CREATED).send(contact);
  }),
};

const getContacts = catchAsync(async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  return res.send(contacts);
});

const getContactById = catchAsync(async (req, res) => {
  const contact = await Contact.findById(req.params._id);
  if (!contact) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Contact not found' });
  }
  return res.send(contact);
});

const deleteContact = catchAsync(async (req, res) => {
  const contact = await Contact.findById(req.params._id);
  if (!contact) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Contact not found' });
  }

  await contact.remove();
  return res.send({ message: 'Contact deleted successfully' });
});

module.exports = {
  createContact,
  getContacts,
  getContactById,
  deleteContact,
};
