const Amenity = require("../models/Amenity");

// GET /api/amenities?level=property|unit
// Returns all active amenities (or all if admin requests with ?all=true)
const getAmenities = async (req, res) => {
  try {
    const { level, all } = req.query;
    const filter = {};
    if (level) filter.level = level;
    // Non-admin callers only see active amenities; admins can see everything
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin || all !== "true") filter.isActive = true;

    const amenities = await Amenity.find(filter).sort({ level: 1, name: 1 });
    res.status(200).json({ success: true, data: amenities });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({ success: false, message: "Failed to fetch amenities", error: error.message });
  }
};

// POST /api/amenities  (admin only)
const createAmenity = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can add amenities" });
    }

    const { name, level } = req.body;
    if (!name || !level) {
      return res.status(400).json({ success: false, message: "name and level are required" });
    }

    const amenity = new Amenity({ name: name.trim(), level });
    await amenity.save();

    res.status(201).json({ success: true, message: "Amenity created", data: amenity });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `"${req.body.name}" already exists at the ${req.body.level} level`,
      });
    }
    console.error("Error creating amenity:", error);
    res.status(500).json({ success: false, message: "Failed to create amenity", error: error.message });
  }
};

// PUT /api/amenities/:id  (admin only)
const updateAmenity = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can edit amenities" });
    }

    const { name, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const amenity = await Amenity.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!amenity) return res.status(404).json({ success: false, message: "Amenity not found" });

    res.status(200).json({ success: true, message: "Amenity updated", data: amenity });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "An amenity with this name already exists at this level" });
    }
    console.error("Error updating amenity:", error);
    res.status(500).json({ success: false, message: "Failed to update amenity", error: error.message });
  }
};

// DELETE /api/amenities/:id  (admin only — soft deletes by setting isActive=false)
const deleteAmenity = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can remove amenities" });
    }

    const amenity = await Amenity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!amenity) return res.status(404).json({ success: false, message: "Amenity not found" });

    res.status(200).json({ success: true, message: "Amenity removed from lists", data: amenity });
  } catch (error) {
    console.error("Error deleting amenity:", error);
    res.status(500).json({ success: false, message: "Failed to remove amenity", error: error.message });
  }
};

module.exports = { getAmenities, createAmenity, updateAmenity, deleteAmenity };
