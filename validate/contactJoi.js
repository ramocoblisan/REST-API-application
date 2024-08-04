import Joi from 'joi';

const contactSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.empty': 'missing required name field'
  }),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().messages({
    'string.empty': 'missing required email field',
    'string.email': 'email must be a valid email'
  }),
  phone: Joi.string().min(10).required().messages({
    'string.empty': 'missing required phone field',
    'string.min': 'phone must be at least 10 characters'
  }),
  favorite: Joi.boolean().optional()
});

const contactUpdateSchema = Joi.object({
  name: Joi.string().min(3).messages({
    'string.min': 'name must be at least 3 characters'
  }),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).messages({
    'string.email': 'email must be a valid email'
  }),
  phone: Joi.string().min(10).messages({
    'string.min': 'phone must be at least 10 characters'
  }),
  favorite: Joi.boolean().optional()
}).or('name', 'email', 'phone', 'favorite').messages({
  'object.missing': 'missing fields'
});

export const validateContact = (contact) => {
  return contactSchema.validate(contact);
};

export const validateContactUpdate = (contact) => {
  return contactUpdateSchema.validate(contact);
};

