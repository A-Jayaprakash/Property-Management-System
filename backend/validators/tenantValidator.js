const { body, param, query, validationResult } = require("express-validator");

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Validation rules for creating a new tenant
const createTenantValidation = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name can only contain letters and spaces"),

  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("phoneNumber")
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage("Please provide a valid phone number (10-15 digits)"),

  body("assignedUnit")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Assigned unit is required and must not exceed 20 characters"),

  body("address.street")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Street address must not exceed 100 characters"),

  body("address.city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City must not exceed 50 characters"),

  body("address.state")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("State must not exceed 50 characters"),

  body("address.zipCode")
    .optional()
    .trim()
    .matches(/^[\d\-\s]{5,10}$/)
    .withMessage("Please provide a valid zip code"),

  body("address.country")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Country must not exceed 50 characters"),

  body("leaseStartDate")
    .isISO8601()
    .toDate()
    .withMessage("Please provide a valid lease start date"),

  body("leaseEndDate")
    .isISO8601()
    .toDate()
    .withMessage("Please provide a valid lease end date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.leaseStartDate)) {
        throw new Error("Lease end date must be after lease start date");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending", "Terminated"])
    .withMessage(
      "Status must be one of: Active, Inactive, Pending, Terminated"
    ),

  body("monthlyRent")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Monthly rent must be a positive number"),

  body("securityDeposit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Security deposit must be a positive number"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),

  body("propertyId")
    .isMongoId()
    .withMessage("Please provide a valid property ID"),

  handleValidationErrors,
];

// Validation rules for updating a tenant
const updateTenantValidation = [
  param("id").isMongoId().withMessage("Please provide a valid tenant ID"),

  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name can only contain letters and spaces"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage("Please provide a valid phone number (10-15 digits)"),

  body("assignedUnit")
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Assigned unit must not exceed 20 characters"),

  body("address.street")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Street address must not exceed 100 characters"),

  body("address.city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City must not exceed 50 characters"),

  body("address.state")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("State must not exceed 50 characters"),

  body("address.zipCode")
    .optional()
    .trim()
    .matches(/^[\d\-\s]{5,10}$/)
    .withMessage("Please provide a valid zip code"),

  body("address.country")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Country must not exceed 50 characters"),

  body("leaseStartDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Please provide a valid lease start date"),

  body("leaseEndDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Please provide a valid lease end date")
    .custom((value, { req }) => {
      if (
        req.body.leaseStartDate &&
        new Date(value) <= new Date(req.body.leaseStartDate)
      ) {
        throw new Error("Lease end date must be after lease start date");
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending", "Terminated"])
    .withMessage(
      "Status must be one of: Active, Inactive, Pending, Terminated"
    ),

  body("monthlyRent")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Monthly rent must be a positive number"),

  body("securityDeposit")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Security deposit must be a positive number"),

  body("emergencyContact.name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Emergency contact name must not exceed 100 characters"),

  body("emergencyContact.relationship")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage(
      "Emergency contact relationship must not exceed 50 characters"
    ),

  body("emergencyContact.phoneNumber")
    .optional()
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{10,15}$/)
    .withMessage("Please provide a valid emergency contact phone number"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must not exceed 500 characters"),

  body("propertyId")
    .optional()
    .isMongoId()
    .withMessage("Please provide a valid property ID"),

  handleValidationErrors,
];

// Validation for tenant ID parameter
const tenantIdValidation = [
  param("id").isMongoId().withMessage("Please provide a valid tenant ID"),
  handleValidationErrors,
];

// Validation for query parameters
const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["Active", "Inactive", "Pending", "Terminated"])
    .withMessage(
      "Status must be one of: Active, Inactive, Pending, Terminated"
    ),

  query("assignedUnit")
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Assigned unit must not exceed 20 characters"),

  query("propertyId")
    .optional()
    .isMongoId()
    .withMessage("Please provide a valid property ID"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),

  query("sortBy")
    .optional()
    .isIn([
      "fullName",
      "email",
      "assignedUnit",
      "leaseStartDate",
      "leaseEndDate",
      "status",
      "createdAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),

  handleValidationErrors,
];

// Validation for relocating tenant
const relocateTenantValidation = [
  param("id").isMongoId().withMessage("Please provide a valid tenant ID"),

  body("newUnit")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("New unit is required and must not exceed 20 characters"),

  body("effectiveDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Please provide a valid effective date"),

  handleValidationErrors,
];

module.exports = {
  createTenantValidation,
  updateTenantValidation,
  tenantIdValidation,
  queryValidation,
  relocateTenantValidation,
};
