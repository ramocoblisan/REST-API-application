import Joi from 'joi';

const userSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().messages({
        'string.email': "Email  must be followed by '.' domain suffix. For example adrian@gmail.com",
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
        subscription: Joi.string()
        .valid('starter', 'pro', 'business')
                  .required()
                  .messages({
                    'string.base': `{{#label}} should be a type of string`,
                    'string.empty': `{{#label}} must contain value`,
                    'any.required': `missing field {{#label}}`,
                  }),
                  token: Joi.string().alphanum().min(3).max(200).messages({
                    'string.base': `{{#label}} should be a type of string`,
                    'string.empty': `{{#label}} must contain value`,
                    'string.min': `{{#label}} should have a minimum length of {#limit}`,
                    'string.max': `{{#label}} should have a maximum length of {#limit}`
                })
});
export const validateUser = (user) => {
    return userSchema.validate(user)
}