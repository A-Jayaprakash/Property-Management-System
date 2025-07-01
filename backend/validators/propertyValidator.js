// Importing necessary modules
const Joi = require('joi');

// Defining the schema for property validation using Joi
// This schema will be used to validate the input data when creating or updating a property
const propertySchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.base': 'Name must be a string',
        'string.min': 'Name must be at least 3 characters long',
        'any.required': 'Name is required'
    }),
    address: Joi.string().required().messages({
        'string.base': 'Address must be a string',
        'any.required': 'Address is required'
    }),
    locality: Joi.string().optional(),
    type: Joi.string().valid('Residential', 'Commercial').required().messages({
        'any.only': 'Type must be either Residential or Commercial',
        'any.required': 'Type is required'
    }),
    unitCount: Joi.number().integer().min(1).required().messages({
        'number.base': 'Unit count must be a number',
        'number.min': 'Unit count must be at least 1',
        'any.required': 'Unit count is required'
    })

});

// Function to validate a property object against the defined schema
// This function will be used to validate the input data when creating or updating a property
const validateProperty = (property) => {
    const { error } = propertySchema.validate(property);
    if (error) {
        return error.details[0].message;
    }
    return null;
};

// Exporting the validateProperty function so it can be used in other parts of the application
module.exports = {
    validateProperty
};