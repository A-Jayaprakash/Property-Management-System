const Unit = require("../models/Unit");
const Property = require("../models/Property");
const Tenant = require("../models/Tenant");
const mongoose = require("mongoose");

// Create a new unit
const createUnit = async (req, res) => {
  try {
    const {
      unit_number,
      property,
      type,
      area,
      area_unit,
      floor,
      rent,
      security_deposit,
      amenities,
      description,
      maintenance_fee,
      lease_terms,
      utilities,
    } = req.body;

    // Validate required fields
    if (
      !unit_number ||
      !property ||
      !type ||
      !area ||
      !floor ||
      rent === undefined ||
      security_deposit === undefined
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: unit_number, property, type, area, floor, rent, security_deposit",
      });
    }

    // Check if property exists
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check if unit number already exists in the property
    const existingUnit = await Unit.findOne({
      unit_number,
      property,
      is_active: true,
    });

    if (existingUnit) {
      return res.status(400).json({
        message: "Unit number already exists in this property",
      });
    }

    // Create new unit
    const newUnit = new Unit({
      unit_number,
      property,
      type,
      area,
      area_unit: area_unit || "sqft",
      floor,
      rent,
      security_deposit,
      amenities: amenities || [],
      description,
      maintenance_fee: maintenance_fee || 0,
      lease_terms: lease_terms || {},
      utilities: utilities || {},
      created_by: req.user.id,
    });

    const savedUnit = await newUnit.save();

    // Populate property details
    await savedUnit.populate("property", "name address type");

    res.status(201).json({
      message: "Unit created successfully",
      unit: savedUnit,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({
      message: "Error creating unit",
      error: error.message,
    });
  }
};

// Get all units with optional filtering
const getAllUnits = async (req, res) => {
  try {
    const {
      property,
      status,
      type,
      min_rent,
      max_rent,
      floor,
      available_only,
      page = 1,
      limit = 10,
      sort_by = "createdAt",
      sort_order = "desc",
    } = req.query;

    // Build filter object
    const filter = { is_active: true };

    if (property) filter.property = property;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (floor) filter.floor = floor;
    if (available_only === "true") filter.status = "available";

    // Rent range filter
    if (min_rent || max_rent) {
      filter.rent = {};
      if (min_rent) filter.rent.$gte = Number(min_rent);
      if (max_rent) filter.rent.$lte = Number(max_rent);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sort_by] = sort_order === "desc" ? -1 : 1;

    // Execute query
    const units = await Unit.find(filter)
      .populate("property", "name address type locality")
      .populate("current_tenant", "name email phone status")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Unit.countDocuments(filter);

    res.json({
      units,
      pagination: {
        current_page: Number(page),
        total_pages: Math.ceil(total / limit),
        total_units: total,
        per_page: Number(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({
      message: "Error fetching units",
      error: error.message,
    });
  }
};

// Get unit by ID
const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await Unit.findById(id)
      .populate("property", "name address type locality unitCount")
      .populate(
        "current_tenant",
        "name email phone status lease_start lease_end"
      );

    if (!unit) {
      return res.status(404).json({
        message: "Unit not found",
      });
    }

    res.json(unit);
  } catch (error) {
    console.error("Error fetching unit:", error);
    res.status(500).json({
      message: "Error fetching unit",
      error: error.message,
    });
  }
};

// Update unit
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if unit exists
    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({
        message: "Unit not found",
      });
    }

    // Check if trying to update unit_number and property combination
    if (updateData.unit_number && updateData.property) {
      const existingUnit = await Unit.findOne({
        unit_number: updateData.unit_number,
        property: updateData.property,
        is_active: true,
        _id: { $ne: id },
      });

      if (existingUnit) {
        return res.status(400).json({
          message: "Unit number already exists in this property",
        });
      }
    }

    // Update unit
    const updatedUnit = await Unit.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("property", "name address type")
      .populate("current_tenant", "name email phone status");

    res.json({
      message: "Unit updated successfully",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    res.status(500).json({
      message: "Error updating unit",
      error: error.message,
    });
  }
};

// Delete unit (soft delete)
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if unit exists
    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({
        message: "Unit not found",
      });
    }

    // Check if unit has active tenants
    const activeTenant = await Tenant.findOne({
      assignedUnit: id,
      status: "active",
    });

    if (activeTenant) {
      return res.status(400).json({
        message:
          "Cannot delete unit with active tenant. Please terminate the lease first.",
      });
    }

    // Soft delete the unit
    unit.is_active = false;
    await unit.save();

    res.json({
      message: "Unit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    res.status(500).json({
      message: "Error deleting unit",
      error: error.message,
    });
  }
};

// Get units by property ID
const getUnitsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    const units = await Unit.getUnitsByProperty(propertyId);

    res.json({
      property: {
        id: property._id,
        name: property.name,
        address: property.address,
      },
      units,
    });
  } catch (error) {
    console.error("Error fetching units by property:", error);
    res.status(500).json({
      message: "Error fetching units by property",
      error: error.message,
    });
  }
};

// Get available units
const getAvailableUnits = async (req, res) => {
  try {
    const { property } = req.query;

    let query = { status: "available", is_active: true };
    if (property) {
      query.property = property;
    }

    const units = await Unit.find(query)
      .populate("property", "name address type")
      .sort({ rent: 1 });

    res.json(units);
  } catch (error) {
    console.error("Error fetching available units:", error);
    res.status(500).json({
      message: "Error fetching available units",
      error: error.message,
    });
  }
};

// Update unit status
// Update unit status
// Update unit status
const updateUnitStatus = async (req, res) => {
  try {
    const { id } = req.params; // this is actually unit_number like "A-100"
    const { status, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid unit ID format" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const unit = await Unit.findById(id);
    if (!unit || !unit.is_active) {
      return res.status(404).json({ message: "Unit not found" });
    }

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Additional check if marking as occupied
    if (status === "occupied") {
      const activeTenant = await Tenant.findOne({
        assignedUnit: unit.unit_number,
        status: "Active",
      });

      if (!activeTenant) {
        return res.status(400).json({
          message: "Cannot mark unit as occupied without an active tenant",
        });
      }
    }

    // Update status
    unit.status = status;
    if (reason) unit.status_reason = reason;
    await unit.save();

    res.json({
      message: "Unit status updated successfully",
      unit: {
        id: unit._id,
        unit_number: unit.unit_number,
        status: unit.status,
      },
    });
  } catch (error) {
    console.error("Error updating unit status:", error);
    res.status(500).json({
      message: "Error updating unit status",
      error: error.message,
    });
  }
};

// Get unit statistics
const getUnitStats = async (req, res) => {
  try {
    const { property } = req.query;

    let matchStage = { is_active: true };
    if (property) {
      matchStage.property = property;
    }

    const stats = await Unit.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total_units: { $sum: 1 },
          available_units: {
            $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] },
          },
          occupied_units: {
            $sum: { $cond: [{ $eq: ["$status", "occupied"] }, 1, 0] },
          },
          maintenance_units: {
            $sum: { $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0] },
          },
          reserved_units: {
            $sum: { $cond: [{ $eq: ["$status", "reserved"] }, 1, 0] },
          },
          total_rent: { $sum: "$rent" },
          avg_rent: { $avg: "$rent" },
          min_rent: { $min: "$rent" },
          max_rent: { $max: "$rent" },
          total_area: { $sum: "$area" },
          avg_area: { $avg: "$area" },
        },
      },
    ]);

    const unitStats = stats[0] || {
      total_units: 0,
      available_units: 0,
      occupied_units: 0,
      maintenance_units: 0,
      reserved_units: 0,
      total_rent: 0,
      avg_rent: 0,
      min_rent: 0,
      max_rent: 0,
      total_area: 0,
      avg_area: 0,
    };

    // Calculate occupancy rate
    unitStats.occupancy_rate =
      unitStats.total_units > 0
        ? Math.round((unitStats.occupied_units / unitStats.total_units) * 100)
        : 0;

    res.json(unitStats);
  } catch (error) {
    console.error("Error fetching unit statistics:", error);
    res.status(500).json({
      message: "Error fetching unit statistics",
      error: error.message,
    });
  }
};

// Search units
const searchUnits = async (req, res) => {
  try {
    const { query, property, min_rent, max_rent, type, status } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    // Build search filter
    const filter = {
      is_active: true,
      $or: [
        { unit_number: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
        { amenities: { $in: [new RegExp(query, "i")] } },
      ],
    };

    // Additional filters
    if (property) filter.property = property;
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (min_rent || max_rent) {
      filter.rent = {};
      if (min_rent) filter.rent.$gte = Number(min_rent);
      if (max_rent) filter.rent.$lte = Number(max_rent);
    }

    const units = await Unit.find(filter)
      .populate("property", "name address type")
      .populate("current_tenant", "name email phone status")
      .sort({ rent: 1 })
      .limit(20);

    res.json({
      query,
      results: units.length,
      units,
    });
  } catch (error) {
    console.error("Error searching units:", error);
    res.status(500).json({
      message: "Error searching units",
      error: error.message,
    });
  }
};

module.exports = {
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
};
