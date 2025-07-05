const Tenant = require("../models/Tenant");

const createTenant = async (req, res) => {
  try {
    const { name, username, email, phone, assigned_unit } = req.body;

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
    const tenants = await Tenant.find({ assigned_unit: { $in: unitIds } });
    return res.status(200).json(tenants);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    await tenant.save();

    return res.status(200).json({ message: "Tenant updated", tenant });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    await tenant.deleteOne();
    return res.status(200).json({ message: "Tenant deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createTenant, getAllTenant, updateTenant, deleteTenant };
