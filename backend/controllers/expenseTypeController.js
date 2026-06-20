const ExpenseType = require("../models/ExpenseType");

const getExpenseTypes = async (req, res) => {
  try {
    const filter = req.user?.role !== "admin" || req.query.all !== "true"
      ? { isActive: true }
      : {};
    const types = await ExpenseType.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createExpenseType = async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Only admins can add expense types" });

    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const type = new ExpenseType({ name: name.trim() });
    await type.save();
    res.status(201).json({ success: true, message: "Expense type created", data: type });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: `"${req.body.name}" already exists` });
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateExpenseType = async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Only admins can edit expense types" });

    const { name, isActive } = req.body;
    const update = {};
    if (name     !== undefined) update.name     = name.trim();
    if (isActive !== undefined) update.isActive = isActive;

    const type = await ExpenseType.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!type) return res.status(404).json({ success: false, message: "Expense type not found" });
    res.status(200).json({ success: true, message: "Expense type updated", data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteExpenseType = async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Only admins can remove expense types" });

    const type = await ExpenseType.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!type) return res.status(404).json({ success: false, message: "Expense type not found" });
    res.status(200).json({ success: true, message: "Expense type disabled", data: type });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getExpenseTypes, createExpenseType, updateExpenseType, deleteExpenseType };
