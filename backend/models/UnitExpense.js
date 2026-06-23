const mongoose = require("mongoose");

const unitExpenseItemSchema = new mongoose.Schema(
  {
    expenseTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpenseType" },
    description:   { type: String, default: "" },
    amount:        { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const unitExpenseSchema = new mongoose.Schema(
  {
    expensePeriodId: { type: mongoose.Schema.Types.ObjectId, ref: "ExpensePeriod", required: true },
    unitId:          { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    items:           [unitExpenseItemSchema],
    miscName:        { type: String, default: "" },
    miscAmount:      { type: Number, default: 0, min: 0 },
    totalAmount:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

unitExpenseSchema.index({ expensePeriodId: 1, unitId: 1 }, { unique: true });

module.exports = mongoose.model("UnitExpense", unitExpenseSchema);
