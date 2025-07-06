const express = require("express");
const router = express.Router();
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  relocateTenant,
  getTenantsByUnit,
  getExpiringLeases,
  getTenantStats,
  extendLease,
} = require("../controllers/tenantController");

const {
  createTenantValidation,
  updateTenantValidation,
  tenantIdValidation,
  queryValidation,
  relocateTenantValidation,
} = require("../validators/tenantValidator");

// @route   POST /api/tenants
// @desc    Create a new tenant
// @access  Private
router.post("/", createTenantValidation, createTenant);

// @route   GET /api/tenants
// @desc    Get all tenants with filtering and pagination
// @access  Private
router.get("/", queryValidation, getAllTenants);

// @route   GET /api/tenants/stats
// @desc    Get tenant statistics
// @access  Private
router.get("/stats", getTenantStats);

// @route   GET /api/tenants/expiring-leases
// @desc    Get tenants with expiring leases
// @access  Private
router.get("/expiring-leases", getExpiringLeases);

// @route   GET /api/tenants/unit/:unit
// @desc    Get tenants by unit
// @access  Private
router.get("/unit/:unit", getTenantsByUnit);

// @route   GET /api/tenants/:id
// @desc    Get a single tenant by ID
// @access  Private
router.get("/:id", tenantIdValidation, getTenantById);

// @route   PUT /api/tenants/:id
// @desc    Update a tenant
// @access  Private
router.put("/:id", updateTenantValidation, updateTenant);

// @route   PATCH /api/tenants/:id/relocate
// @desc    Relocate tenant to a different unit
// @access  Private
router.patch("/:id/relocate", relocateTenantValidation, relocateTenant);

// @route   PATCH /api/tenants/:id/extend-lease
// @desc    Extend lease for a tenant
// @access  Private
router.patch(
  "/:id/extend-lease",
  [
    tenantIdValidation[0], // Only the param validation
    require("express-validator")
      .body("newEndDate")
      .isISO8601()
      .toDate()
      .withMessage("Please provide a valid new end date"),
    (req, res, next) => {
      const { validationResult } = require("express-validator");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      next();
    },
  ],
  extendLease
);

// @route   DELETE /api/tenants/:id
// @desc    Delete a tenant
// @access  Private
router.delete("/:id", tenantIdValidation, deleteTenant);

module.exports = router;
