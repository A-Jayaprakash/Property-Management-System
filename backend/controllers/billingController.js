const BillingPeriod = require("../models/BillingPeriod");
const UnitBill     = require("../models/UnitBill");

// ─── Helpers ────────────────────────────────────────────────────────────────

// Server-side amount computation — client preview is for UX only; this is authoritative
function computeLineItem(item) {
  const prev = Number(item.prevReading) || 0;
  const curr = Number(item.currReading) || 0;
  const rate = Number(item.rate)        || 0;

  let units  = null;
  let amount = 0;

  if (item.chargeType === "Reading") {
    units = curr - prev;
    if (units < 0)
      throw new Error(
        `Reading error for "${item.description}": current reading (${curr}) cannot be less than previous reading (${prev})`
      );
    amount = units * rate;
  } else if (item.chargeType === "Usage") {
    units  = Number(item.units) || 0;
    amount = units * rate;
  } else {
    amount = Number(item.amount) || 0;
  }

  return {
    chargeId:    item.chargeId,
    description: item.description,
    chargeType:  item.chargeType,
    prevReading: item.prevReading,
    currReading: item.currReading,
    units,
    rate,
    amount,
  };
}

// ─── Controllers ────────────────────────────────────────────────────────────

// GET /api/billing/periods?propertyId=X
const getPeriods = async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId)
      return res.status(400).json({ success: false, message: "propertyId is required" });

    const periods = await BillingPeriod.find({ propertyId })
      .sort({ year: -1, month: -1 })
      .populate("createdBy", "username name");

    res.status(200).json({ success: true, data: periods });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/billing/periods — create or return existing (idempotent)
const getOrCreatePeriod = async (req, res) => {
  try {
    const { propertyId, month, year } = req.body;
    if (!propertyId || !month || !year)
      return res.status(400).json({ success: false, message: "propertyId, month, and year are required" });

    let period = await BillingPeriod.findOne({
      propertyId,
      month: Number(month),
      year:  Number(year),
    });

    if (!period) {
      period = await BillingPeriod.create({
        propertyId,
        month:     Number(month),
        year:      Number(year),
        createdBy: req.user.id,
      });
    }

    res.status(200).json({ success: true, data: period });
  } catch (err) {
    // Race-condition duplicate — just return the existing one
    if (err.code === 11000) {
      const period = await BillingPeriod.findOne({
        propertyId: req.body.propertyId,
        month:      Number(req.body.month),
        year:       Number(req.body.year),
      });
      return res.status(200).json({ success: true, data: period });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing/periods/:id
const getPeriodWithBills = async (req, res) => {
  try {
    const period = await BillingPeriod.findById(req.params.id)
      .populate("propertyId", "name address");
    if (!period)
      return res.status(404).json({ success: false, message: "Billing period not found" });

    const bills = await UnitBill.find({ billingPeriodId: period._id });
    res.status(200).json({ success: true, data: { period, bills, expenses: period.expenses || [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing/previous-readings?propertyId=X&month=M&year=Y
// Returns { "${unitId}_${chargeId}": prevReading } for all Reading charges in the previous published period
const getPreviousReadings = async (req, res) => {
  try {
    const { propertyId, month, year } = req.query;

    // Only the immediately preceding month counts — skipped months break the chain
    const m = Number(month);
    const y = Number(year);
    const prevMonth = m === 1 ? 12 : m - 1;
    const prevYear  = m === 1 ? y - 1 : y;

    const prevPeriod = await BillingPeriod.findOne({
      propertyId,
      status: "published",
      month: prevMonth,
      year:  prevYear,
    });

    if (!prevPeriod)
      return res.status(200).json({ success: true, data: {} });

    const bills = await UnitBill.find({ billingPeriodId: prevPeriod._id });

    const readings = {};
    bills.forEach((bill) => {
      bill.lineItems.forEach((item) => {
        if (item.chargeType === "Reading" && item.currReading != null) {
          readings[`${bill.unitId}_${item.chargeId}`] = item.currReading;
        }
      });
    });

    res.status(200).json({ success: true, data: readings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/billing/periods/:id/bills — save all unit bills (draft only)
const saveBills = async (req, res) => {
  try {
    const period = await BillingPeriod.findById(req.params.id);
    if (!period)
      return res.status(404).json({ success: false, message: "Billing period not found" });
    if (period.status === "published")
      return res.status(400).json({ success: false, message: "Cannot edit a published billing period" });

    const { bills } = req.body;
    if (!Array.isArray(bills))
      return res.status(400).json({ success: false, message: "bills must be an array" });

    for (const billData of bills) {
      // Compute all line item amounts server-side
      let lineItems;
      try {
        lineItems = (billData.lineItems || []).map(computeLineItem);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      // miscItems = owner's expenses per unit — saved but NOT counted in tenant's totalAmount
      const miscItems = (billData.miscItems || [])
        .filter((m) => m.description && Number(m.amount) >= 0)
        .map((m) => ({
          expenseTypeId: m.expenseTypeId || undefined,
          description:   m.description,
          amount:        Number(m.amount),
        }));

      const rentAmount  = Number(billData.rentAmount) || 0;
      const totalAmount =
        rentAmount +
        lineItems.reduce((s, li) => s + li.amount, 0);

      await UnitBill.findOneAndUpdate(
        { billingPeriodId: period._id, unitId: billData.unitId },
        {
          billingPeriodId: period._id,
          unitId:          billData.unitId,
          tenantId:        billData.tenantId || undefined,
          rentAmount,
          lineItems,
          miscItems,
          totalAmount,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.status(200).json({ success: true, message: "Bills saved successfully" });
  } catch (err) {
    console.error("saveBills error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/billing/periods/:id/publish
const publishPeriod = async (req, res) => {
  try {
    const period = await BillingPeriod.findById(req.params.id);
    if (!period)
      return res.status(404).json({ success: false, message: "Billing period not found" });
    if (period.status === "published")
      return res.status(400).json({ success: false, message: "Already published" });

    // Freeze tenant + unit data into snapshots before locking
    const bills = await UnitBill.find({ billingPeriodId: period._id })
      .populate("unitId",   "unit_number type floor")
      .populate("tenantId", "fullName phoneNumber");

    for (const bill of bills) {
      if (bill.tenantId) {
        bill.tenantSnapshot = {
          fullName:    bill.tenantId.fullName,
          phoneNumber: bill.tenantId.phoneNumber,
        };
      }
      if (bill.unitId) {
        bill.unitSnapshot = {
          unit_number: bill.unitId.unit_number,
          type:        bill.unitId.type,
          floor:       bill.unitId.floor,
        };
      }
      await bill.save();
    }

    period.status = "published";
    await period.save();

    res.status(200).json({ success: true, message: "Billing period published", data: period });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/billing/periods/:id/print — data shaped for the print view
const getPrintData = async (req, res) => {
  try {
    const period = await BillingPeriod.findById(req.params.id)
      .populate("propertyId", "name address");
    if (!period)
      return res.status(404).json({ success: false, message: "Billing period not found" });

    const bills = await UnitBill.find({ billingPeriodId: period._id })
      .populate("unitId",   "unit_number type floor")
      .populate("tenantId", "fullName phoneNumber")
      .sort({ "unitSnapshot.unit_number": 1 });

    const printBills = bills.map((bill) => ({
      _id:         bill._id,
      unitNumber:  bill.unitSnapshot?.unit_number  || bill.unitId?.unit_number  || "—",
      floor:       bill.unitSnapshot?.floor        ?? bill.unitId?.floor        ?? "—",
      tenantName:  bill.tenantSnapshot?.fullName   || bill.tenantId?.fullName   || "Vacant",
      tenantPhone: bill.tenantSnapshot?.phoneNumber || bill.tenantId?.phoneNumber || "",
      rentAmount:  bill.rentAmount,
      lineItems:   bill.lineItems,
      miscItems:   bill.miscItems,
      totalAmount: bill.totalAmount,
    }));

    res.status(200).json({ success: true, data: { period, bills: printBills, expenses: period.expenses || [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/billing/periods/:id/expenses — save owner expenses for this period
const saveExpenses = async (req, res) => {
  try {
    const period = await BillingPeriod.findById(req.params.id);
    if (!period)
      return res.status(404).json({ success: false, message: "Billing period not found" });
    if (period.status === "published")
      return res.status(400).json({ success: false, message: "Cannot edit a published billing period" });

    period.expenses = (req.body.expenses || [])
      .filter((e) => e.description && Number(e.amount) >= 0)
      .map((e) => ({
        expenseTypeId: e.expenseTypeId || undefined,
        description:   e.description,
        amount:        Number(e.amount),
      }));

    await period.save();
    res.status(200).json({ success: true, message: "Expenses saved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPeriods,
  getOrCreatePeriod,
  getPeriodWithBills,
  getPreviousReadings,
  saveBills,
  saveExpenses,
  publishPeriod,
  getPrintData,
};
