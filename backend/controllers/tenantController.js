const Tenant = require("../models/Tenant");
const mongoose = require("mongoose");

// Create a new tenant
const createTenant = async (req, res) => {
  try {
    // Check if email already exists
    console.log("Incoming Tenant Data:", req.body);
    if (!req.body.unitId) {
      return res.status(400).json({
        success: false,
        message: "Unit ID is missing from request body",
      });
    }

    const existingTenant = await Tenant.findOne({ email: req.body.email });
    if (existingTenant) {
      return res.status(400).json({
        success: false,
        message: "A tenant with this email already exists",
      });
    }

    // Check if unit is already occupied using unitId
    const unitOccupied = await Tenant.findOne({
      unitId: req.body.unitId,
      status: "Active",
    });
    if (unitOccupied) {
      return res.status(400).json({
        success: false,
        message: "This unit is already occupied by an active tenant",
      });
    }

    const tenant = new Tenant(req.body);

    await tenant.save();

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tenant",
      error: error.message,
    });
  }
};

// Get all tenants with filtering, pagination, and search
const getAllTenants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      assignedUnit,
      unitId,
      propertyId,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (assignedUnit) filter.assignedUnit = assignedUnit;
    if (unitId) filter.unitId = unitId;
    if (propertyId) filter.propertyId = propertyId;

    // Add search functionality
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { assignedUnit: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with populated unitId
    const tenants = await Tenant.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("propertyId", "name address")
      .populate("unitId", "unit_number type rent area floor");

    // Get total count for pagination
    const totalCount = await Tenant.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: tenants,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
      error: error.message,
    });
  }
};

// Get a single tenant by ID
const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate("propertyId", "name address")
      .populate("unitId", "unit_number type rent area floor");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant",
      error: error.message,
    });
  }
};

// Update a tenant
const updateTenant = async (req, res) => {
  try {
    // Check if trying to update email to an existing one
    if (req.body.email) {
      const existingTenant = await Tenant.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id },
      });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: "A tenant with this email already exists",
        });
      }
    }

    // Check if trying to move to an occupied unit
    if (req.body.unitId) {
      const currentTenant = await Tenant.findById(req.params.id);
      if (
        currentTenant &&
        currentTenant.unitId.toString() !== req.body.unitId
      ) {
        const unitOccupied = await Tenant.findOne({
          unitId: req.body.unitId,
          status: "Active",
          _id: { $ne: req.params.id },
        });
        if (unitOccupied) {
          return res.status(400).json({
            success: false,
            message: "This unit is already occupied by an active tenant",
          });
        }
      }
    }

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("propertyId", "name address")
      .populate("unitId", "unit_number type rent area floor");

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tenant",
      error: error.message,
    });
  }
};

// Delete a tenant
const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tenant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tenant",
      error: error.message,
    });
  }
};

// Relocate tenant to a different unit
const relocateTenant = async (req, res) => {
  try {
    const { newUnitId, newUnit, effectiveDate } = req.body;

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // Check if new unit is available using unitId
    const unitOccupied = await Tenant.findOne({
      unitId: newUnitId,
      status: "Active",
      _id: { $ne: req.params.id },
    });
    if (unitOccupied) {
      return res.status(400).json({
        success: false,
        message: "The new unit is already occupied by an active tenant",
      });
    }

    // Update tenant with new unit
    tenant.unitId = newUnitId;
    tenant.assignedUnit = newUnit;
    if (effectiveDate) {
      tenant.notes = `${tenant.notes || ""} Relocated from ${
        tenant.assignedUnit
      } to ${newUnit} on ${new Date(
        effectiveDate
      ).toLocaleDateString()}`.trim();
    }

    await tenant.save();

    res.status(200).json({
      success: true,
      message: "Tenant relocated successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error relocating tenant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to relocate tenant",
      error: error.message,
    });
  }
};

// Get tenants by unit ID
const getTenantsByUnitId = async (req, res) => {
  try {
    const { unitId } = req.params;

    const tenants = await Tenant.find({ unitId })
      .populate("propertyId", "name address")
      .populate("unitId", "unit_number type rent area floor");

    res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error fetching tenants by unit ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenants by unit ID",
      error: error.message,
    });
  }
};

// Get tenants by unit number (keeping for backward compatibility)
const getTenantsByUnit = async (req, res) => {
  try {
    const { unit } = req.params;
    const { propertyId } = req.query;

    const filter = { assignedUnit: unit };
    if (propertyId) filter.propertyId = propertyId;

    const tenants = await Tenant.find(filter)
      .populate("propertyId", "name address")
      .populate("unitId", "unit_number type rent area floor");

    res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error("Error fetching tenants by unit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenants by unit",
      error: error.message,
    });
  }
};

// Get expiring leases
const getExpiringLeases = async (req, res) => {
  try {
    const { daysAhead = 30 } = req.query;

    const expiringLeases = await Tenant.findExpiringLeases(parseInt(daysAhead))
      .populate("propertyId", "name address")
      .populate("unitId", "unit_number type rent area floor");

    res.status(200).json({
      success: true,
      data: expiringLeases,
      count: expiringLeases.length,
    });
  } catch (error) {
    console.error("Error fetching expiring leases:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch expiring leases",
      error: error.message,
    });
  }
};

// Get tenant statistics
const getTenantStats = async (req, res) => {
  try {
    const { propertyId } = req.query;
    const filter = propertyId ? { propertyId } : {};

    const stats = await Tenant.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRent: { $sum: "$monthlyRent" },
        },
      },
    ]);

    const totalTenants = await Tenant.countDocuments(filter);
    const expiringLeases = await Tenant.findExpiringLeases(30);

    res.status(200).json({
      success: true,
      data: {
        totalTenants,
        statusBreakdown: stats,
        expiringLeases: expiringLeases.length,
      },
    });
  } catch (error) {
    console.error("Error fetching tenant stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant statistics",
      error: error.message,
    });
  }
};

// Extend lease for a tenant
const extendLease = async (req, res) => {
  try {
    const { newEndDate } = req.body;

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    await tenant.extendLease(new Date(newEndDate));

    res.status(200).json({
      success: true,
      message: "Lease extended successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error extending lease:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extend lease",
      error: error.message,
    });
  }
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  relocateTenant,
  getTenantsByUnit,
  getTenantsByUnitId, // New method for unit ID
  getExpiringLeases,
  getTenantStats,
  extendLease,
};
