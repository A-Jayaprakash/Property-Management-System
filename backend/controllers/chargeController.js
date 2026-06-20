const Charge = require("../models/Charge");

// GET /api/charges?level=unit|property&all=true
const getCharges = async (req, res) => {
  try {
    const { level, all } = req.query;
    const filter = {};
    if (level) filter.level = level;
    if (req.user?.role !== "admin" || all !== "true") filter.isActive = true;

    const charges = await Charge.find(filter).sort({ level: 1, chargeType: 1, name: 1 });
    res.status(200).json({ success: true, data: charges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/charges  (admin only)
const createCharge = async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Only admins can add charges" });

    const { name, chargeType, level, rate } = req.body;
    if (!name || !chargeType || !level)
      return res.status(400).json({ success: false, message: "name, chargeType, and level are required" });

    const charge = new Charge({ name: name.trim(), chargeType, level, rate: Number(rate) || 0 });
    await charge.save();
    res.status(201).json({ success: true, message: "Charge created", data: charge });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: `"${req.body.name}" already exists at the ${req.body.level} level` });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/charges/:id  (admin only)
const updateCharge = async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Only admins can edit charges" });

    const { name, chargeType, rate, isActive } = req.body;
    const update = {};
    if (name      !== undefined) update.name       = name.trim();
    if (chargeType !== undefined) update.chargeType = chargeType;
    if (rate      !== undefined) update.rate       = Number(rate);
    if (isActive  !== undefined) update.isActive   = isActive;

    const charge = await Charge.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!charge) return res.status(404).json({ success: false, message: "Charge not found" });
    res.status(200).json({ success: true, message: "Charge updated", data: charge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/charges/:id — soft-disable (admin only)
const deleteCharge = async (req, res) => {
  try {
    if (req.user?.role !== "admin")
      return res.status(403).json({ success: false, message: "Only admins can remove charges" });

    const charge = await Charge.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!charge) return res.status(404).json({ success: false, message: "Charge not found" });
    res.status(200).json({ success: true, message: "Charge disabled", data: charge });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCharges, createCharge, updateCharge, deleteCharge };
