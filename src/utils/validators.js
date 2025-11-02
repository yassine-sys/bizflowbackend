const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  company_name: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const accountSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.string().allow('', null)
});

module.exports = { registerSchema, loginSchema, accountSchema };
