const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const { authorizeRoles } = require("../middlewares/authMiddleware");

// GET Request to fetch all properties
// All authenticated users can view properties
router.get("/", propertyController.getAllProperties);

// POST Request to create a new property
// Only admin and manager can create properties
router.post(
  "/",
  authorizeRoles("admin", "manager"),
  propertyController.createProperty
);

// PUT Request to update a property
// Only admin and manager can update properties (with ownership check in controller)
router.put(
  "/:id",
  authorizeRoles("admin", "manager"),
  propertyController.updateProperty
);

// DELETE Request to delete a property
// Only admin and manager can delete properties (with ownership check in controller)
router.delete(
  "/:id",
  authorizeRoles("admin", "manager"),
  propertyController.deleteProperty
);

// Exporting the router module
module.exports = router;
