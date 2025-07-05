const Tenant = require("../models/Tenant");
const Unit = require("../models/Unit");

const createTenant = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { name, username, email, phone, assigned_unit } = req.body;

    const unit = await Unit.findById(assigned_unit);
    if (!unit || unit.manager.toString() !== managerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to assign tenant to this unit" });
    }

    const existingTenant = await Tenant.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingTenant) {
      return res
        .status(400)
        .json({ message: "Tenant with this email or phone already exists" });
    }

    const newTenant = new Tenant({
      name,
      username,
      email,
      phone,
      assigned_unit,
    });
    await newTenant.save();

    return res
      .status(201)
      .json({ message: "Tenant Successfully Created", tenant: newTenant });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllTenant = async (req, res) => {
  try {
    const managerId = req.user.id;
    const units = await Unit.find({ manager: managerId }).select("_id");
    const unitIds = units.map((unit) => unit._id);
    const tenants = await Tenant.find({ assigned_unit: { $in: unitIds } });
    return res.status(200).json(tenants);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateTenant = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const currentUnit = await Unit.findById(tenant.assigned_unit);
    if (!currentUnit || currentUnit.manager.toString() !== managerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this tenant" });
    }

    // If unit is being changed, check manager permission on new unit
    if (
      updates.assigned_unit &&
      updates.assigned_unit !== tenant.assigned_unit.toString()
    ) {
      const newUnit = await Unit.findById(updates.assigned_unit);
      if (!newUnit || newUnit.manager.toString() !== managerId) {
        return res
          .status(403)
          .json({ message: "Unauthorized to assign tenant to this new unit" });
      }
    }

    Object.assign(tenant, updates);
    await tenant.save();

    return res.status(200).json({ message: "Tenant updated", tenant });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { id } = req.params;

    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const unit = await Unit.findById(tenant.assigned_unit);
    if (!unit || unit.manager.toString() !== managerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this tenant" });
    }

    await tenant.deleteOne();
    return res.status(200).json({ message: "Tenant deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createTenant, getAllTenant, updateTenant, deleteTenant };
