const Tenant = require("../models/Tenant");
const Property = require("../models/Property"); // Add this import

const createTenant = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      assigned_unit,
      address,
      lease_start,
      lease_end,
      status,
    } = req.body;

    // Check if the assigned unit exists and belongs to the manager
    const property = await Property.findOne({
      "units._id": assigned_unit,
      manager: req.user.id, // Assuming req.user.id contains the manager's ID from the auth token
    });

    if (!property) {
      return res.status(400).json({
        message: "Invalid unit or unit does not belong to you",
      });
    }

    // Check if tenant with same email or phone already exists
    const existingTenant = await Tenant.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingTenant) {
      return res.status(400).json({
        message: "Tenant with this email or phone number already exists",
      });
    }

    const newTenant = new Tenant({
      name,
      email,
      phone,
      assigned_unit,
      address,
      lease_start,
      lease_end,
      status: status || "active",
    });

    await newTenant.save();

    return res.status(201).json({
      message: "Tenant Successfully Created",
      tenant: newTenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllTenant = async (req, res) => {
  try {
    // Get all properties belonging to the manager
    const properties = await Property.find({ manager: req.user.id });

    // Extract all unit IDs from the manager's properties
    const unitIds = properties.reduce((acc, property) => {
      const propertyUnitIds = property.units.map((unit) => unit._id);
      return acc.concat(propertyUnitIds);
    }, []);

    // Find tenants assigned to these units
    const tenants = await Tenant.find({
      assigned_unit: { $in: unitIds },
    }).populate("assigned_unit");

    return res.status(200).json(tenants);
  } catch (error) {
    console.error("Error getting tenants:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      assigned_unit,
      address,
      lease_start,
      lease_end,
      status,
    } = req.body;

    // First, check if the tenant exists and belongs to the manager
    const properties = await Property.find({ manager: req.user.id });
    const unitIds = properties.reduce((acc, property) => {
      const propertyUnitIds = property.units.map((unit) => unit._id.toString());
      return acc.concat(propertyUnitIds);
    }, []);

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Check if the current tenant belongs to the manager
    if (!unitIds.includes(tenant.assigned_unit.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    // If updating assigned_unit, verify the new unit belongs to the manager
    if (assigned_unit && assigned_unit !== tenant.assigned_unit.toString()) {
      if (!unitIds.includes(assigned_unit)) {
        return res.status(400).json({
          message: "Invalid unit or unit does not belong to you",
        });
      }
    }

    // Check for duplicate email or phone (excluding current tenant)
    const existingTenant = await Tenant.findOne({
      _id: { $ne: id },
      $or: [{ email }, { phone }],
    });

    if (existingTenant) {
      return res.status(400).json({
        message:
          "Another tenant with this email or phone number already exists",
      });
    }

    // Update the tenant
    const updatedTenant = await Tenant.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        assigned_unit,
        address,
        lease_start,
        lease_end,
        status,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Tenant updated successfully",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Error updating tenant:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if the tenant exists and belongs to the manager
    const properties = await Property.find({ manager: req.user.id });
    const unitIds = properties.reduce((acc, property) => {
      const propertyUnitIds = property.units.map((unit) => unit._id.toString());
      return acc.concat(propertyUnitIds);
    }, []);

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Check if the tenant belongs to the manager
    if (!unitIds.includes(tenant.assigned_unit.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Tenant.findByIdAndDelete(id);

    return res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { createTenant, getAllTenant, updateTenant, deleteTenant };
