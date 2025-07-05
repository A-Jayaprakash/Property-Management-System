const express = require("express");
const router = express.Router();
const {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  getUnitsByProperty,
  getAvailableUnits,
  updateUnitStatus,
  getUnitStats,
  searchUnits,
} = require("../controllers/unitController");

// Middleware to check if user is admin or manager
const checkManagerAccess = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({
      message: "Access denied. Only admin and manager can manage units.",
    });
  }
  next();
};

// Middleware to check if user is admin, manager, or tenant (for read operations)
const checkReadAccess = (req, res, next) => {
  if (!["admin", "manager", "tenant"].includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied. Invalid user role.",
    });
  }
  next();
};

// GET /api/units/stats - Get unit statistics
router.get("/stats", checkReadAccess, getUnitStats);

// GET /api/units/search - Search units
router.get("/search", checkReadAccess, searchUnits);

// GET /api/units/available - Get available units
router.get("/available", checkReadAccess, getAvailableUnits);

// GET /api/units/property/:propertyId - Get units by property
router.get("/property/:propertyId", checkReadAccess, getUnitsByProperty);

// GET /api/units - Get all units with filtering and pagination
router.get("/", checkReadAccess, getAllUnits);

// GET /api/units/:id - Get unit by ID
router.get("/:id", checkReadAccess, getUnitById);

// POST /api/units - Create new unit
router.post("/", checkManagerAccess, createUnit);

// PUT /api/units/:id - Update unit
router.put("/:id", checkManagerAccess, updateUnit);

// PATCH /api/units/:id/status - Update unit status
router.patch("/:id/status", checkManagerAccess, updateUnitStatus);

// DELETE /api/units/:id - Delete unit
router.delete("/:id", checkManagerAccess, deleteUnit);

module.exports = router;
