const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { body, validationResult } = require("express-validator");

// Validation middleware for tenant creation
const validateTenant = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email").isEmail().withMessage("Please provide a valid email address"),

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
    .withMessage("Address cannot exceed 200 characters"),

  body("lease_start")
    .optional()
    .isISO8601()
    .withMessage("Invalid lease start date"),

  body("lease_end")
    .optional()
    .isISO8601()
    .withMessage("Invalid lease end date"),

  body("status")
    .optional()
    .isIn(["active", "inactive", "terminated"])
    .withMessage("Status must be active, inactive, or terminated"),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Routes
router.post(
  "/register",
  verifyToken,
  validateTenant,
  handleValidationErrors,
  tenantController.createTenant
);

router.get("/", verifyToken, tenantController.getAllTenant);

router.put(
  "/:id",
  verifyToken,
  validateTenant,
  handleValidationErrors,
  tenantController.updateTenant
);

router.delete("/:id", verifyToken, tenantController.deleteTenant);

module.exports = router;
