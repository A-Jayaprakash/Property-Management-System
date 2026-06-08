const express = require("express");
const router = express.Router();
const {
  getAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
} = require("../controllers/amenityController");

// @route   GET /api/amenities?level=property|unit
// @desc    Get all active amenities (optionally filtered by level)
// @access  Private
router.get("/", getAmenities);

// @route   POST /api/amenities
// @desc    Add a new amenity (admin only)
// @access  Private / Admin
router.post("/", createAmenity);

// @route   PUT /api/amenities/:id
// @desc    Rename or toggle active state (admin only)
// @access  Private / Admin
router.put("/:id", updateAmenity);

// @route   DELETE /api/amenities/:id
// @desc    Soft-remove amenity from lists (admin only)
// @access  Private / Admin
router.delete("/:id", deleteAmenity);

module.exports = router;
