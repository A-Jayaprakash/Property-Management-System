const { body, validationResult } = require("express-validator");

// Validation rules for tenant creation and updates
const validateTenant = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("assigned_unit")
    .notEmpty()
    .withMessage("Assigned unit is required")
    .isMongoId()
    .withMessage("Invalid unit ID"),

  body("address")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters")
    .trim(),

  body("lease_start")
    .optional()
    .isISO8601()
    .withMessage("Invalid lease start date format"),

  body("lease_end")
    .optional()
    .isISO8601()
    .withMessage("Invalid lease end date format")
    .custom((value, { req }) => {
      if (value && req.body.lease_start) {
        const startDate = new Date(req.body.lease_start);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error("Lease end date must be after lease start date");
        }
      }
      return true;
    }),

  body("status")
    .optional()
    .isIn(["active", "inactive", "terminated"])
    .withMessage("Status must be active, inactive, or terminated"),
];

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

module.exports = {
  validateTenant,
  handleValidationErrors,
};
