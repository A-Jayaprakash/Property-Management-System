const express = require("express");
const router = express.Router();
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  deactivateTenant,
  relocateTenant,
  getTenantsByUnit,
  getTenantsByUnitId,
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
// @desc    Get tenants by unit number (string)
// @access  Private
router.get("/unit/:unit", getTenantsByUnit);

// @route   GET /api/tenants/unit-id/:unitId
// @desc    Get tenants by unit ObjectId reference
// @access  Private
router.get("/unit-id/:unitId", getTenantsByUnitId);

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

// @route   PATCH /api/tenants/:id/deactivate
// @desc    Deactivate a tenant (keeps profile, sets status Inactive)
// @access  Private
router.patch("/:id/deactivate", tenantIdValidation, deactivateTenant);

// @route   DELETE /api/tenants/:id
// @desc    Hard-delete a tenant (admin only, for data correction)
// @access  Private
router.delete("/:id", tenantIdValidation, deleteTenant);

module.exports = router;
