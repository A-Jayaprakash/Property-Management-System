// Importing necessary modules
const Joi = require("joi");

// Defining the schema for property validation using Joi
const propertySchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  address: Joi.string().min(5).max(200).required().messages({
    "string.base": "Address must be a string",
    "string.min": "Address must be at least 5 characters long",
    "string.max": "Address must not exceed 200 characters",
    "any.required": "Address is required",
  }),
  locality: Joi.string().allow("", null).max(100).optional().messages({
    "string.base": "Locality must be a string",
    "string.max": "Locality must not exceed 100 characters",
  }),
  type: Joi.string().required().messages({
    "any.required": "Type is required",
  }),
  unitCount: Joi.number().integer().min(1).max(10000).required().messages({
    "number.base": "Unit count must be a number",
    "number.integer": "Unit count must be a whole number",
    "number.min": "Unit count must be at least 1",
    "number.max": "Unit count must not exceed 10000",
    "any.required": "Unit count is required",
  }),
  createdBy: Joi.string().optional().allow(null), // Optional field for user reference
});

// Function to validate a property object against the defined schema
const validateProperty = (property) => {
  const { error } = propertySchema.validate(property, {
    abortEarly: false, // Show all validation errors
    stripUnknown: true, // Remove unknown fields
  });

  if (error) {
    // Return the first error message
    return error.details[0].message;
  }
  return null;
};

// Function to get all validation errors (useful for debugging)
const validatePropertyAll = (property) => {
  const { error } = propertySchema.validate(property, { abortEarly: false });
  if (error) {
    return error.details.map((detail) => detail.message);
  }
  return null;
};

// Exporting the validation functions
module.exports = {
  validateProperty,
  validatePropertyAll,
};
