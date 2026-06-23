const ExpensePeriod = require("../models/ExpensePeriod");
const UnitExpense   = require("../models/UnitExpense");
const Unit          = require("../models/Unit");

const isPrivileged = (role) => role === "admin" || role === "manager";

// GET /api/expenses/periods?propertyId=X
const getPeriods = async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ success: false, message: "propertyId is required" });

    const periods = await ExpensePeriod.find({ propertyId })
      .sort({ year: -1, month: -1 })
      .select("month year status createdAt");

    res.json({ success: true, data: periods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/expenses/periods  — get-or-create for a given month/year/property
const getOrCreatePeriod = async (req, res) => {
  try {
    if (!isPrivileged(req.user?.role))
      return res.status(403).json({ success: false, message: "Access denied" });

    const { propertyId, month, year } = req.body;
    if (!propertyId || !month || !year)
      return res.status(400).json({ success: false, message: "propertyId, month, year are required" });

    let period = await ExpensePeriod.findOne({ propertyId, month, year });
    if (!period) {
      period = await ExpensePeriod.create({
        propertyId,
        month,
        year,
        createdBy: req.user.id,
        propertyItems: [],
      });
    }

    res.json({ success: true, data: period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expenses/periods/:id  — period + all unit expenses
const getPeriodWithExpenses = async (req, res) => {
  try {
    const period = await ExpensePeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ success: false, message: "Expense period not found" });

    const unitExpenses = await UnitExpense.find({ expensePeriodId: period._id })
      .populate("unitId", "unit_number floor");

    res.json({ success: true, data: { period, unitExpenses } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/expenses/periods/:id  — save all (property items + unit expenses)
const saveExpenses = async (req, res) => {
  try {
    if (!isPrivileged(req.user?.role))
      return res.status(403).json({ success: false, message: "Access denied" });

    const period = await ExpensePeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ success: false, message: "Expense period not found" });
    if (period.status === "finalized")
      return res.status(400).json({ success: false, message: "This expense period is finalized and cannot be edited" });

    const { propertyItems = [], unitExpenses = [] } = req.body;

    // Save property-level items
    period.propertyItems = propertyItems;
    await period.save();

    // Upsert unit expenses
    for (const ue of unitExpenses) {
      const total = (ue.items || []).reduce((s, i) => s + (Number(i.amount) || 0), 0)
                  + (Number(ue.miscAmount) || 0);

      await UnitExpense.findOneAndUpdate(
        { expensePeriodId: period._id, unitId: ue.unitId },
        {
          items:       ue.items || [],
          miscName:    ue.miscName || "",
          miscAmount:  Number(ue.miscAmount) || 0,
          totalAmount: total,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: "Expenses saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/expenses/periods/:id/finalize
const finalizePeriod = async (req, res) => {
  try {
    if (!isPrivileged(req.user?.role))
      return res.status(403).json({ success: false, message: "Access denied" });

    const period = await ExpensePeriod.findById(req.params.id);
    if (!period) return res.status(404).json({ success: false, message: "Expense period not found" });

    period.status = "finalized";
    await period.save();

    res.json({ success: true, message: "Expense period finalized", data: period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPeriods, getOrCreatePeriod, getPeriodWithExpenses, saveExpenses, finalizePeriod };
