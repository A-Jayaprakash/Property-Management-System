const mongoose = require("mongoose");
const Property     = require("../models/Property");
const Unit         = require("../models/Unit");
const BillingPeriod = require("../models/BillingPeriod");
const UnitBill     = require("../models/UnitBill");
const ExpensePeriod = require("../models/ExpensePeriod");
const UnitExpense  = require("../models/UnitExpense");
const ExpenseType  = require("../models/ExpenseType");

const MONTH_LABELS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Helpers ────────────────────────────────────────────────────────────────

function parseRange(range) {
  const now = new Date();
  const toYear  = now.getFullYear();
  const toMonth = now.getMonth() + 1;
  const months  = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 }[range] || 6;

  let fromMonth = toMonth - months + 1;
  let fromYear  = toYear;
  while (fromMonth < 1) { fromMonth += 12; fromYear--; }

  return {
    fromYear, fromMonth, toYear, toMonth,
    fromIndex: fromYear * 12 + fromMonth,
    toIndex:   toYear   * 12 + toMonth,
    months,
  };
}

function buildMonthRange(fromYear, fromMonth, toYear, toMonth) {
  const result = [];
  let y = fromYear, m = fromMonth;
  while (y * 12 + m <= toYear * 12 + toMonth) {
    result.push({ year: y, month: m, label: `${MONTH_LABELS[m]} ${y}` });
    if (++m > 12) { m = 1; y++; }
  }
  return result;
}

function periodExpr(fromIndex, toIndex) {
  return {
    $and: [
      { $gte: [{ $add: [{ $multiply: ["$year", 12] }, "$month"] }, fromIndex] },
      { $lte: [{ $add: [{ $multiply: ["$year", 12] }, "$month"] }, toIndex] },
    ],
  };
}

// Fetch billing periods + aggregate unit bill revenue for a set of propertyIds
async function fetchRevenue(propertyIds, fromIndex, toIndex) {
  const periods = await BillingPeriod.find({
    propertyId: { $in: propertyIds },
    $expr: periodExpr(fromIndex, toIndex),
  }).lean();

  if (!periods.length) return { periods: [], billMap: {} };

  const billAgg = await UnitBill.aggregate([
    { $match: { billingPeriodId: { $in: periods.map(p => p._id) } } },
    {
      $group: {
        _id: "$billingPeriodId",
        revenue: { $sum: "$totalAmount" },
        miscExpenses: {
          $sum: {
            $reduce: {
              input: "$miscItems", initialValue: 0,
              in: { $add: ["$$value", "$$this.amount"] },
            },
          },
        },
      },
    },
  ]);

  const billMap = {};
  billAgg.forEach(a => { billMap[a._id.toString()] = a; });
  return { periods, billMap };
}

// Fetch expense periods + unit expense totals for a set of propertyIds
async function fetchExpenses(propertyIds, fromIndex, toIndex) {
  const expPeriods = await ExpensePeriod.find({
    propertyId: { $in: propertyIds },
    $expr: periodExpr(fromIndex, toIndex),
  }).lean();

  if (!expPeriods.length) return { expPeriods: [], unitExpMap: {} };

  const unitExpAgg = await UnitExpense.aggregate([
    { $match: { expensePeriodId: { $in: expPeriods.map(p => p._id) } } },
    { $group: { _id: "$expensePeriodId", total: { $sum: "$totalAmount" } } },
  ]);

  const unitExpMap = {};
  unitExpAgg.forEach(a => { unitExpMap[a._id.toString()] = a.total; });
  return { expPeriods, unitExpMap };
}

// Combine into monthly P&L entries
function buildMonthly(monthRange, periods, billMap, expPeriods, unitExpMap) {
  return monthRange.map(({ year, month, label }) => {
    const bps = periods.filter(p => p.year === year && p.month === month);
    let revenue = 0, miscExp = 0;
    bps.forEach(p => {
      const a = billMap[p._id.toString()];
      if (a) { revenue += a.revenue || 0; miscExp += a.miscExpenses || 0; }
    });

    const eps = expPeriods.filter(p => p.year === year && p.month === month);
    let expModule = 0;
    eps.forEach(p => {
      expModule += (p.propertyItems || []).reduce((s, i) => s + (i.amount || 0), 0);
      expModule += unitExpMap[p._id.toString()] || 0;
    });

    const expenses = expModule + miscExp;
    return { year, month, label, revenue, expenses, profit: revenue - expenses };
  });
}

// Expense breakdown per expense type for a set of expPeriods + unit expenses
async function buildExpenseBreakdown(expPeriods, unitExpPeriodIds) {
  const breakdown = {};

  // Property-level items
  expPeriods.forEach(ep => {
    (ep.propertyItems || []).forEach(item => {
      const key = item.expenseTypeId?.toString() || "misc";
      breakdown[key] = (breakdown[key] || { amount: 0, name: "Other" });
      breakdown[key].amount += item.amount || 0;
      if (!breakdown[key].id) breakdown[key].id = item.expenseTypeId;
    });
  });

  // Unit-level items
  if (unitExpPeriodIds && unitExpPeriodIds.length) {
    const unitExpItems = await UnitExpense.find({
      expensePeriodId: { $in: unitExpPeriodIds },
    }).lean();

    unitExpItems.forEach(ue => {
      ue.items.forEach(item => {
        const key = item.expenseTypeId?.toString() || "misc";
        if (!breakdown[key]) breakdown[key] = { amount: 0, name: "Other" };
        breakdown[key].amount += item.amount || 0;
        if (!breakdown[key].id) breakdown[key].id = item.expenseTypeId;
      });
      if (ue.miscAmount > 0) {
        breakdown["misc"] = breakdown["misc"] || { amount: 0, name: "Other / Misc" };
        breakdown["misc"].amount += ue.miscAmount;
      }
    });
  }

  // Populate expense type names
  const typeIds = Object.values(breakdown).filter(b => b.id).map(b => b.id);
  if (typeIds.length) {
    const types = await ExpenseType.find({ _id: { $in: typeIds } }).lean();
    const typeMap = {};
    types.forEach(t => { typeMap[t._id.toString()] = t.name; });
    Object.values(breakdown).forEach(b => {
      if (b.id) b.name = typeMap[b.id.toString()] || "Other";
    });
  }

  return Object.values(breakdown)
    .filter(b => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

// ── Overall Report ─────────────────────────────────────────────────────────
const getOverallReport = async (req, res) => {
  try {
    const { range = "6M" } = req.query;
    const { fromYear, fromMonth, toYear, toMonth, fromIndex, toIndex } = parseRange(range);
    const monthRange = buildMonthRange(fromYear, fromMonth, toYear, toMonth);

    const role   = req.user?.role;
    const userId = req.user?.id;
    const propFilter = role === "admin" ? {} : { createdBy: new mongoose.Types.ObjectId(userId) };
    const properties = await Property.find(propFilter).lean();
    const propertyIds = properties.map(p => p._id);

    if (!propertyIds.length) {
      return res.json({ success: true, data: { summary: emptySum(), monthly: monthRange.map(m => ({ ...m, revenue: 0, expenses: 0, profit: 0 })), properties: [], expenseBreakdown: [] } });
    }

    const units = await Unit.find({ property: { $in: propertyIds }, isDeleted: { $ne: true } }).lean();
    const totalUnits    = units.length;
    const occupiedUnits = units.filter(u => u.status === "occupied").length;

    const { periods, billMap }         = await fetchRevenue(propertyIds, fromIndex, toIndex);
    const { expPeriods, unitExpMap }   = await fetchExpenses(propertyIds, fromIndex, toIndex);

    const monthly = buildMonthly(monthRange, periods, billMap, expPeriods, unitExpMap);
    const totalRevenue  = monthly.reduce((s, m) => s + m.revenue, 0);
    const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
    const netProfit     = totalRevenue - totalExpenses;

    // Per-property breakdown
    const propertyBreakdown = properties.map(prop => {
      const pid     = prop._id.toString();
      const propMon = buildMonthly(
        monthRange,
        periods.filter(p => p.propertyId.toString() === pid),
        billMap,
        expPeriods.filter(p => p.propertyId.toString() === pid),
        unitExpMap
      );
      const rev = propMon.reduce((s, m) => s + m.revenue,   0);
      const exp = propMon.reduce((s, m) => s + m.expenses,  0);
      const propUnits = units.filter(u => u.property.toString() === pid);
      return {
        _id: prop._id, name: prop.name, type: prop.type,
        unitCount: prop.unitCount,
        occupiedUnits: propUnits.filter(u => u.status === "occupied").length,
        revenue: rev, expenses: exp, profit: rev - exp,
        profitMargin: rev > 0 ? +((rev - exp) / rev * 100).toFixed(1) : 0,
      };
    }).sort((a, b) => b.profit - a.profit);

    // Expense breakdown across all
    const expBreakdown = await buildExpenseBreakdown(expPeriods, expPeriods.map(p => p._id));

    res.json({
      success: true,
      data: {
        summary: {
          totalProperties: properties.length,
          totalUnits, occupiedUnits,
          occupancyRate: totalUnits > 0 ? +((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
          totalRevenue, totalExpenses, netProfit,
          profitMargin: totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : 0,
        },
        monthly,
        properties: propertyBreakdown,
        expenseBreakdown: expBreakdown,
      },
    });
  } catch (err) {
    console.error("Overall report error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Property Report ────────────────────────────────────────────────────────
const getPropertyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = "6M" } = req.query;
    const { fromYear, fromMonth, toYear, toMonth, fromIndex, toIndex } = parseRange(range);
    const monthRange = buildMonthRange(fromYear, fromMonth, toYear, toMonth);

    const property = await Property.findById(id).lean();
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    const propertyIds = [property._id];
    const units = await Unit.find({ property: property._id, isDeleted: { $ne: true } }).lean();
    const totalUnits    = units.length;
    const occupiedUnits = units.filter(u => u.status === "occupied").length;

    const { periods, billMap }       = await fetchRevenue(propertyIds, fromIndex, toIndex);
    const { expPeriods, unitExpMap } = await fetchExpenses(propertyIds, fromIndex, toIndex);

    const monthly = buildMonthly(monthRange, periods, billMap, expPeriods, unitExpMap);
    const totalRevenue  = monthly.reduce((s, m) => s + m.revenue,  0);
    const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
    const netProfit     = totalRevenue - totalExpenses;

    // Per-unit breakdown via billing
    const periodIds = periods.map(p => p._id);
    const unitBillAgg = await UnitBill.aggregate([
      { $match: { billingPeriodId: { $in: periodIds } } },
      {
        $group: {
          _id: "$unitId",
          revenue:      { $sum: "$totalAmount" },
          miscExpenses: { $sum: { $reduce: { input: "$miscItems", initialValue: 0, in: { $add: ["$$value", "$$this.amount"] } } } },
        },
      },
    ]);

    const unitExpByUnit = await UnitExpense.aggregate([
      { $match: { expensePeriodId: { $in: expPeriods.map(p => p._id) } } },
      { $group: { _id: "$unitId", expenses: { $sum: "$totalAmount" } } },
    ]);
    const unitExpMap2 = {};
    unitExpByUnit.forEach(u => { unitExpMap2[u._id.toString()] = u.expenses; });

    const unitBreakdown = units.map(u => {
      const uid  = u._id.toString();
      const bill = unitBillAgg.find(b => b._id.toString() === uid) || {};
      const rev  = bill.revenue || 0;
      const exp  = (bill.miscExpenses || 0) + (unitExpMap2[uid] || 0);
      return {
        _id: u._id,
        unit_number: u.unit_number, floor: u.floor, type: u.type,
        status: u.status,
        tenantName: u.current_tenant?.fullName || "Vacant",
        revenue: rev, expenses: exp, profit: rev - exp,
        profitMargin: rev > 0 ? +((rev - exp) / rev * 100).toFixed(1) : 0,
      };
    }).sort((a, b) => b.profit - a.profit);

    const expBreakdown = await buildExpenseBreakdown(expPeriods, expPeriods.map(p => p._id));

    res.json({
      success: true,
      data: {
        property: { _id: property._id, name: property.name, type: property.type, address: property.address },
        summary: {
          totalUnits, occupiedUnits,
          occupancyRate: totalUnits > 0 ? +((occupiedUnits / totalUnits) * 100).toFixed(1) : 0,
          totalRevenue, totalExpenses, netProfit,
          profitMargin: totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : 0,
        },
        monthly,
        units: unitBreakdown,
        expenseBreakdown: expBreakdown,
      },
    });
  } catch (err) {
    console.error("Property report error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Unit Report ────────────────────────────────────────────────────────────
const getUnitReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = "6M" } = req.query;
    const { fromYear, fromMonth, toYear, toMonth, fromIndex, toIndex } = parseRange(range);
    const monthRange = buildMonthRange(fromYear, fromMonth, toYear, toMonth);

    const unit = await Unit.findById(id).populate("property", "name address type").lean();
    if (!unit) return res.status(404).json({ success: false, message: "Unit not found" });

    const unitObjId = unit._id;

    // Revenue per month (via billing lookup)
    const unitBills = await UnitBill.aggregate([
      {
        $lookup: {
          from: "billingperiods", localField: "billingPeriodId",
          foreignField: "_id", as: "period",
        },
      },
      { $unwind: "$period" },
      {
        $match: {
          unitId: unitObjId,
          $expr: periodExpr(fromIndex, toIndex),
        },
      },
      {
        $project: {
          year: "$period.year", month: "$period.month",
          revenue: "$totalAmount",
          miscExpenses: {
            $reduce: { input: "$miscItems", initialValue: 0, in: { $add: ["$$value", "$$this.amount"] } },
          },
          miscItems: 1,
        },
      },
    ]);

    // Unit expenses per month
    const unitExpenses = await UnitExpense.aggregate([
      {
        $lookup: {
          from: "expenseperiods", localField: "expensePeriodId",
          foreignField: "_id", as: "period",
        },
      },
      { $unwind: "$period" },
      {
        $match: {
          unitId: unitObjId,
          $expr: periodExpr(fromIndex, toIndex),
        },
      },
      {
        $project: {
          year: "$period.year", month: "$period.month",
          expenses: "$totalAmount",
          items: 1, miscAmount: 1,
        },
      },
    ]);

    const monthly = monthRange.map(({ year, month, label }) => {
      const bills = unitBills.filter(b => b.year === year && b.month === month);
      const exps  = unitExpenses.filter(e => e.year === year && e.month === month);
      const revenue  = bills.reduce((s, b) => s + (b.revenue || 0), 0);
      const miscExp  = bills.reduce((s, b) => s + (b.miscExpenses || 0), 0);
      const expMod   = exps.reduce((s, e)  => s + (e.expenses  || 0), 0);
      const expenses = miscExp + expMod;
      return { year, month, label, revenue, expenses, profit: revenue - expenses };
    });

    const totalRevenue  = monthly.reduce((s, m) => s + m.revenue,  0);
    const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
    const netProfit     = totalRevenue - totalExpenses;

    // Expense breakdown for this unit
    const expBreakdown = {};
    unitBills.forEach(b => {
      (b.miscItems || []).forEach(m => {
        const key = m.description || "Misc";
        expBreakdown[key] = (expBreakdown[key] || 0) + (m.amount || 0);
      });
    });
    unitExpenses.forEach(e => {
      (e.items || []).forEach(i => {
        const key = `type_${i.expenseTypeId}`;
        if (!expBreakdown[key]) expBreakdown[key] = { typeId: i.expenseTypeId, amount: 0, name: key };
        if (typeof expBreakdown[key] === "object") expBreakdown[key].amount += i.amount || 0;
      });
      if (e.miscAmount > 0) {
        expBreakdown["Misc"] = (typeof expBreakdown["Misc"] === "number" ? expBreakdown["Misc"] : 0) + e.miscAmount;
      }
    });

    // Resolve expense type names
    const typeIds = unitExpenses.flatMap(e => e.items.map(i => i.expenseTypeId)).filter(Boolean);
    const typeMap = {};
    if (typeIds.length) {
      const types = await ExpenseType.find({ _id: { $in: typeIds } }).lean();
      types.forEach(t => { typeMap[t._id.toString()] = t.name; });
    }

    const breakdown = [];
    // From billing misc items
    unitBills.forEach(b => {
      (b.miscItems || []).forEach(m => {
        const existing = breakdown.find(x => x.name === m.description);
        if (existing) existing.amount += m.amount || 0;
        else breakdown.push({ name: m.description || "Misc", amount: m.amount || 0 });
      });
    });
    // From unit expense items
    unitExpenses.forEach(e => {
      (e.items || []).forEach(i => {
        const name = typeMap[i.expenseTypeId?.toString()] || "Expense";
        const existing = breakdown.find(x => x.name === name);
        if (existing) existing.amount += i.amount || 0;
        else breakdown.push({ name, amount: i.amount || 0 });
      });
      if (e.miscAmount > 0) {
        const existing = breakdown.find(x => x.name === "Other / Misc");
        if (existing) existing.amount += e.miscAmount;
        else breakdown.push({ name: "Other / Misc", amount: e.miscAmount });
      }
    });

    res.json({
      success: true,
      data: {
        unit: {
          _id: unit._id, unit_number: unit.unit_number,
          floor: unit.floor, type: unit.type, rent: unit.rent,
          status: unit.status,
          tenantName: unit.current_tenant?.fullName || "Vacant",
        },
        property: unit.property,
        summary: {
          totalRevenue, totalExpenses, netProfit,
          profitMargin: totalRevenue > 0 ? +((netProfit / totalRevenue) * 100).toFixed(1) : 0,
        },
        monthly,
        expenseBreakdown: breakdown.filter(b => b.amount > 0).sort((a, b) => b.amount - a.amount),
      },
    });
  } catch (err) {
    console.error("Unit report error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

function emptySum() {
  return { totalProperties: 0, totalUnits: 0, occupiedUnits: 0, occupancyRate: 0, totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 };
}

module.exports = { getOverallReport, getPropertyReport, getUnitReport };
